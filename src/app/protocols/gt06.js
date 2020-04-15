import { hexToDecimal, bufferToHexString, decimalToHex, toBuffer, crc, utf8ToHex, hexToBinary, hexToUtf8 } from '../lib/functions';
import Command from '../models/Command';

import Events from '../lib/Events';

export default class GT06 {

    startBit = [0x78, 0x78];
    stopBit = [0x0d, 0x0a];
    DYD = toBuffer(utf8ToHex("DYD,000000#"));
    HFYD = toBuffer(utf8ToHex("HFYD,000000#"));

    constructor(client, queue) {
        this.client = client;
        this.queue = queue;
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
            default:
                console.log(`Protocolo não identificado ${protocol}`);
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
            electricity: this.electricity
        };

        if (this.ignition === undefined || this.electricity === undefined) return;

        this.queue.sendToQueue('positions', Buffer.from(JSON.stringify(position)));
        console.log("posição enviada");
    }

    async alarm() {
        Events.batteryFailure(this.imei);
    }

    async heartBeat(protocol) {
        protocol = toBuffer(decimalToHex(protocol));
        const content = [0x05, ...protocol, ...this.getSerialNumber()];
        const status = hexToDecimal(this.data.substring(8, 10)).toString(2).padStart(8, '0');
        this.electricity = status[0] === '0' ? true : false;
        this.ignition = status[6] === '0' ? false : true;
        console.log(status);

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
        const _id = this.data.substr(10, 8);

        await Command.updateOne(
            { _id },
            { status },
        );
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

        console.log(parsedDate);

        return parsedDate;
    }

    getCoordinates() {
        const byte1 = hexToBinary(hexToDecimal(this.data.substring(40, 42)));
        const byte2 = hexToBinary(hexToDecimal(this.data.substring(40, 42)));

        console.log(`${byte1} - ${byte2}`);

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