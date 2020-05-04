import { isPointInPolygon, isPointWithinRadius, findNearest } from 'geolib';
import { format, isAfter, isWithinInterval, parseISO } from 'date-fns';
import Event from '../models/Event';
import LastPosition from '../models/LastPosition';
import EventConfig from '../models/EventConfig';
import Position from '../models/Position';
import amqp from 'amqplib/callback_api';
import redis from '../../database/redis';

class Events {
    async setPosition(position) {
        const { imei, velocity, ignition, longitude, latitude } = position;

        this.imei = imei;
        this.velocity = velocity;
        this.ignition = ignition;
        this.coords = [longitude, latitude];
        this.logs = '';
    }

    async setLastPosition() {
        const lastPosition = await LastPosition.findOne({ imei: this.imei }).populate('events_config');

        if (!lastPosition)
            return this.addLog(400); //Ultima posição não encontrada

        const { velocity, ignition, longitude, latitude, events_config } = lastPosition;

        if (!events_config)
            return this.addLog(401); //Nenhum evento configurado
        if (!events_config.events_config)
            return this.addLog(401);
        if (Object.keys(events_config.events_config).length === 0)
            return this.addLog(401);

        this.lastVelocity = velocity;
        this.lastIgnition = ignition;
        this.lastCoords = [longitude, latitude];
        this.eventsConfig = events_config.events_config;
        this.configId = events_config._id;

        return true;
    }

    async storePosition(position) {
        await this.setPosition(position);
        await this.checkEvents();

        await Position(this.imei).create(position);
        const lastPosition = await LastPosition.updateOne({ imei: this.imei }, position);
        if (lastPosition.nModified === 0)
            LastPosition.create(position);
        redis.set(this.imei, JSON.stringify({ date: position.gps_date, ignition: this.ignition }));

        this.sendLogs();
    }

    async checkEvents() {
        if (!(await this.setLastPosition())) return;

        const { siege, ignition, velocity, ignitionAndVelocity, siegeAndVelocity, points, pointsAndTime, anchor, theft } = this.eventsConfig;

        this.addLog(100);
        if (await this.validateConfig(siege, 'siege') &&
            await this.checkSiege(siege))
            await Event.create({
                imei: this.imei,
                type: "siege"
            });

        this.addLog(101);
        if (await this.validateConfig(ignition, 'ignition') &&
            await this.checkIgnition(ignition))
            await Event.create({
                imei: this.imei,
                type: "ignition"
            });

        this.addLog(102);
        if (await this.validateConfig(velocity, 'velocity') &&
            await this.checkVelocity(velocity))
            await Event.create({
                imei: this.imei,
                type: "velocity"
            });

        this.addLog(103);
        if (await this.validateConfig(ignitionAndVelocity, 'ignitionAndVelocity') &&
            await this.checkVelocity(ignitionAndVelocity) &&
            await this.checkIgnition(ignitionAndVelocity))
            await Event.create({
                imei: this.imei,
                type: "ignitionAndVelocity"
            });

        this.addLog(104);
        if (await this.validateConfig(siegeAndVelocity, 'siegeAndVelocity') &&
            await this.checkVelocity(siegeAndVelocity) &&
            await this.checkSiege(siegeAndVelocity))
            await Event.create({
                imei: this.imei,
                type: "siegeAndVelocity"
            });

        this.addLog(105);
        if (await this.validateConfig(points, 'points') &&
            await this.checkPoints(points))
            await Event.create({
                imei: this.imei,
                type: "points"
            });

        this.addLog(106);
        if (await this.validateConfig(pointsAndTime, 'pointsAndTime') &&
            await this.checkPoints(pointsAndTime)) {
            amqp.connect('amqp://localhost:5672', (error, conn) => {
                if (error) this.addLog(error);
                conn.createChannel((error, ch) => {
                    if (error) this.addLog(error);

                    ch.publish('delay-exchange', '',
                        Buffer.from(JSON.stringify({ imei: this.imei, checkPoint: this.checkPoint })), { headers: { 'x-delay': pointsAndTime.time.toString() } }
                    );
                    this.addLog(`Time ativado para ${pointsAndTime.time}ms`);
                });
            });
        }

        this.checkAnchor(anchor);
        this.checkTheft(theft);
    }

    async validateConfig(config, type) {
        if (!config)
            return this.addLog(402); //Não configurado

        const isValid = await this.defaultConfigs(type, config);

        if (!isValid) return false;
        return true;
    }

    async checkPoints(config) {
        const { points, _in, _out, radius, continuous } = config;

        this.checkPoint = findNearest(this.coords, points);

        const isInside = isPointWithinRadius(this.coords, this.checkPoint, radius);
        const isLastPositionInside = isPointWithinRadius(this.lastCoords, this.checkPoint, radius);

        if (isInside) {
            if (!_in) return this.addLog(409); //_in desativado!
            if (!continuous && isLastPositionInside)
                return this.addLog(411); //1x ativo e ultima posição dentro do raio

            return true;
        } else {
            if (!_out) return this.addLog(410) //_out desativado!
            if (!continuous && !isLastPositionInside)
                return this.addLog(411); //1x ativo e ultima posição fora do raio

            return true;
        }
    }

    async checkPointsAndTime({ imei, checkPoint }) {
        const lastPosition = await LastPosition.findOne({ imei });

        if (!lastPosition) return false;

        const { longitude, latitude, events_config } = lastPosition;

        const coords = [longitude, latitude];

        const { _in, _out, radius } = events_config.pointsAndTime;

        const isInside = isPointWithinRadius(coords, checkPoint, radius);

        if (isInside) {
            if (!_in) return this.addLog(409); //_in dasativado

            await Event.create({
                imei,
                type: "pointsAndTime"
            });
            return;
        }

        if (!_out) return this.addLog(410); //_out dasativado

        await Event.create({
            imei,
            type: "pointsAndTime"
        });
    }

    async checkVelocity(config) {
        const { velocity, operator, continuous } = config;

        if (operator === "greaterOrEq" && this.velocity >= velocity) {
            if (!continuous && this.lastVelocity >= velocity)
                return this.addLog(411); //1x ativo e ultima velocidade maior ou igual a estipulada

            return true;
        } else if (operator === "lessThan" && this.velocity < velocity) {
            if (!continuous && this.lastVelocity < velocity)
                return this.addLog(411); //1x ativo e ultima velocidade menor que a estipulada

            return true;
        }
    }

    async checkIgnition(config) {
        const { on, off, continuous } = config;

        if (this.ignition) {
            if (!on) return this.addLog(412); //on desativado
            if (!continuous && this.lastIgnition) return this.addLog(411); //1x tipo ativo e ignição ativada

            return true;
        }

        if (!off) return this.addLog(413); //off desativado
        if (!continuous && !this.lastIgnition) return this.addLog(411); //1x tipo ativo e ignição desativada

        return true;
    }

    async checkSiege(config) {
        const { siege, _in, _out, continuous } = config;

        let lastSiege = isPointInPolygon(this.lastCoords, siege);
        let currentSiege = isPointInPolygon(this.coords, siege);

        if (currentSiege) {
            if (!_in) return this.addLog(409);
            if (!continuous && lastSiege) return this.addLog(411); //1x ativo e veiculo dentro da cerca

            return true;
        }
        if (!_out) return this.addLog(410);
        if (!continuous && !lastSiege) return this.addLog(411); //1x ativo e veiculo fora da cerca

        return true;
    }

    async defaultConfigs(type, config) {
        const { active, initial_date, final_date, initial_time, final_time, suspend_till, schedule, once_a_day } = config;
        const today = new Date();

        if (!active)
            return this.addLog(403); //Evento desativado

        if (!isWithinInterval(today, {
                start: parseISO(initial_date),
                end: parseISO(final_date)
            })) return this.addLog(404); //Evento vencido

        const setTime = (time) => {
            const [hours, minutes] = time.split(":");
            const today = new Date();

            today.setHours(hours);
            today.setMinutes(minutes);

            return today;
        };

        if (!isWithinInterval(
                today, {
                    start: setTime(initial_time),
                    end: setTime(final_time)
                }
            )) return this.addLog(405); //Evento fora do horário de funcionamento

        if (suspend_till && isAfter(parseISO(suspend_till), today))
            return this.addLog(406); //Evento suspenso

        if (schedule && !schedule.includes(format(new Date(), 'iiii'))) return this.addLog(407); //Dia inválido

        if (once_a_day) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const event = await Event.findOne({ imei: this.imei, type, createdAt: { $gte: start, $lt: end } });

            if (event) return this.addLog(408); //Evento do dia já foi gerado
        }

        return true;
    }

    async checkAnchor(config, radius = 20) {
        this.addLog(107);
        if (!config || !config.active) return !config ? this.addLog(402) : this.addLog(403);

        if (!isPointWithinRadius(this.coords, config.point, radius))
            await Event.create({
                imei: this.imei,
                type: "anchor"
            });
    }

    async checkTheft(config) {
        this.addLog(108);
        if (!config || !config.active) return !config ? this.addLog(402) : this.addLog(403); //Furto e roubo desativado

        await Event.create({
            imei: this.imei,
            type: "theft"
        });

        const configs = {...this.eventsConfig, theft: { active: false } };

        await EventConfig.updateOne({ _id: this.configId }, { events_config: configs });
    }

    async batteryFailure(imei) {
        this.logs = "";
        this.imei = imei;
        this.addLog(109);
        const { events_config } = await LastPosition.findOne({ imei }).populate('events_config');

        if (!events_config) {
            this.addLog(402);
            return this.sendLogs();
        };
        if (!events_config.events_config) {
            this.addLog(402);
            return this.sendLogs();
        };
        const { battery } = events_config.events_config;

        if (!battery) {
            this.addLog(402);
            return this.sendLogs();
        };

        const isValid = await this.defaultConfigs('battery', battery);

        if (!isValid) return this.sendLogs();

        await Event.create({
            imei: this.imei,
            type: "battery"
        });
        console.log(this.logs);
        this.sendLogs();
    }

    addLog(log) {
        this.logs += this.logs ? `,${log}` : log;
    }

    sendLogs() {
        const logs = { imei: this.imei, logs: this.logs, receivedAt: new Date() };
        amqp.connect('amqp://localhost:5672', (error, conn) => {
            conn.createChannel((error, ch) => {
                ch.sendToQueue('event-log', Buffer.from(JSON.stringify(logs)));
            });
        });
    }
}

export default new Events();