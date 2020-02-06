import { format, isAfter, addMinutes } from 'date-fns';
import { isPointInPolygon } from 'geolib';

import { hexToDecimal, bufferToHexString, decimalToHex, toBuffer, crc, utf8ToHex, hexToBinary, hexToUtf8 } from '../lib/functions';
import Position from '../models/Position';
import LastPosition from '../models/LastPosition';
import Anchor from '../models/Anchor';
import Event from '../models/Event';
import Command from '../models/Command';

export default class GT06 {

    startBit = [0x78, 0x78];
    stopBit = [0x0d, 0x0a];
    DYD = toBuffer(utf8ToHex("DYD,000000#"));
    HFYD = toBuffer(utf8ToHex("HFYD,000000#"));
    anchor = false;

    constructor(client) {
        this.client = client;
    }

    receivedData(data) {
        this.data = bufferToHexString(data);
        const protocolo = hexToDecimal(this.data.substr(6, 2));

        this.protocolRouter(protocolo);
        console.log(toBuffer(this.data));
    }

    protocolRouter(protocol) {
        switch (protocol) {
            case 1:
                console.log(`Protocol ${protocol} function loginRequest`);
                return this.loginRequest();
            case 18:
                console.log(`Protocol ${protocol} function report`);
                return this.report();
            case 35:
            case 19:
                console.log(`Protocol ${protocol} function heartBeat`);
                return this.heartBeat(protocol);
            case 21:
                console.log(`Protocol ${protocol} function commandResponse`);
                return this.commandResponse();
            case 22:
                console.log(`Protocol ${protocol} function alarm`);
                return this.alarm();
        }
    }

    async loginRequest() {
        this.imei = this.data.substr(9, 15);
        const content = [0x05, 0x01, ...this.getSerialNumber()];
        this.verifyAnchor = new Date();
        return this.client.write(this.createResponsePackage(content));
    }

    async report() {

        const position = {
            imei: this.imei,
            ...this.getCoordinates(),
            gps_date: this.getDate(),
            ignition: this.ignition,
            electricity: this.electricity,
            anchor: this.anchor
        };

        if (isAfter(new Date(), this.verifyAnchor)) {
            this.isAnchored(position);
        }

        await Position.create(position);
    }

    async alarm() {
        await Event.create({
            imei: this.imei,
            type: "Falha de Bateria"
        });
    }

    async heartBeat(protocol) {
        protocol = toBuffer(decimalToHex(protocol));
        const content = [0x05, ...protocol, ...this.getSerialNumber()];
        const status = hexToDecimal(this.data.substring(8, 10)).toString(2).padStart(8, '0');
        this.electricity = status[0] === '0' ? true : false;
        this.ignition = status[6] === '0' ? false : true;
        console.log(status);
        await LastPosition.update(
            {
                ignition: this.ignition,
                electricity: this.electricity
            },
            {
                where: { imei: this.imei }
            }
        );

        return this.client.write(this.createResponsePackage(content));
    }

    cutOilAndElectricity(identifier) {
        const content = [0x15, 0x80, 0x0f, ...toBuffer(identifier), ...this.DYD, 0x00, ...this.getSerialNumber()];
        this.client.write(this.createResponsePackage(content));

        return "Enviado!";
    }

    restoreOilAndElectricity(identifier) {
        const content = [0x16, 0x80, 0x10, ...toBuffer(identifier), ...this.HFYD, 0x00, ...this.getSerialNumber()];
        this.client.write(this.createResponsePackage(content));

        return "Enviado!";
    }

    async commandResponse() {
        const status = hexToUtf8(this.data.substring(18, this.data.length - 16));
        const identifier = this.data.substr(10, 8);
        const command = status.indexOf("DYD") != -1 ? 'cut': 'restore';

        await Command.create({
            imei: this.imei,
            identifier,
            status,
            command,
            type: 'response'
        });
    }

    getSerialNumber() {
        return toBuffer(this.data.substr(this.data.length - 10, 2));
    }

    getImei() {
        return this.imei;
    }

    createResponsePackage(content) {
        const errorCheck = crc(content);
        console.log(toBuffer([...this.startBit, ...content, ...errorCheck, ...this.stopBit]));
        return toBuffer([...this.startBit, ...content, ...errorCheck, ...this.stopBit]);
    }

    getDate() {
        const date = {
            year: 2000 + hexToDecimal(this.data.substring(8, 10)),
            month: hexToDecimal(this.data.substring(10, 12)) - 1,
            day: hexToDecimal(this.data.substring(12, 14)),
            hours: hexToDecimal(this.data.substring(14, 16)) - 3,
            minutes: hexToDecimal(this.data.substring(16, 18)),
            seconds: hexToDecimal(this.data.substring(18, 20))
        }

        const parsedDate = new Date(date.year, date.month, date.day, date.hours, date.minutes, date.seconds);

        const formattedDate = format(parsedDate, "dd'/'MM'/'yyyy HH':'mm':'ss");
        console.log(formattedDate);

        return formattedDate;
    }

    async isAnchored(position) {
        const lastPosition = await LastPosition.findOne({ where: { imei: this.imei }, attributes: ['anchor'] });

        if (lastPosition && lastPosition.anchor) {
            this.anchor = true;
            this.verifyAnchor = addMinutes(new Date(), 1);
            console.log(this.verifyAnchor);
            this.anchorEvent(position);
        }
    }

    async anchorEvent(position) {
        const { anchor } = await Anchor.findOne({ where: { imei: this.imei } });

        if (!isPointInPolygon(position, anchor)) {
            await Event.create({
                imei: this.imei,
                type: "Âncoragem"
            });
        }

    }

    getCoordinates() {
        const byte1 = hexToBinary(hexToDecimal(this.data.substring(40, 42)));
        const byte2 = hexToBinary(hexToDecimal(this.data.substring(40, 42)));

        const latitude = (byte1[3] == 1 ? -1 : 1) * parseInt(this.data.substring(22, 30), 16) / 1800000;
        const longitude = (byte1[2] == 1 ? 1 : -1) * parseInt(this.data.substring(30, 38), 16) / 1800000;

        let course = 0;

        let finalArray = [byte2[6], byte2[7], ...byte1];

        finalArray.forEach((bit, index) => {
            if (bit == 1) {
                course += Math.pow(2, 9 - index);
            }
        });

        const gps = {
            latitude,
            longitude,
            course,
            velocity: hexToDecimal(this.data.substr(38, 1)),
            url: `http://maps.google.com/maps?q=loc:${latitude},${longitude}`
        }

        console.log(gps);
        return gps;
    }
}