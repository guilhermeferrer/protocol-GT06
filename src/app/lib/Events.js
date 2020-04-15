import { isPointInPolygon, isPointWithinRadius, findNearest } from 'geolib';
import { format, isAfter, isWithinInterval, parseISO } from 'date-fns';
import Event from '../models/Event';
import LastPosition from '../models/LastPosition';
import Position from '../models/Position';
import amqp from 'amqplib/callback_api';

class Events {
    async setPosition(position) {
        const { imei, velocity, ignition, longitude, latitude } = position;

        this.imei = imei;
        this.velocity = velocity;
        this.ignition = ignition;
        this.coords = [longitude, latitude];
    }

    async setLastPosition() {
        const lastPosition = await LastPosition.findOne({ imei: this.imei });

        if (!lastPosition) return false;

        const { velocity, ignition, longitude, latitude, events_config } = lastPosition;

        if (Object.keys(events_config).length === 0) return false;

        this.lastVelocity = velocity;
        this.lastIgnition = ignition;
        this.lastCoords = [longitude, latitude];
        this.eventsConfig = events_config;

        return true;
    }

    async storePosition(position) {
        await this.setPosition(position);
        await this.checkEvents();

        await Position(this.imei).create(position);
        await LastPosition.updateOne({ imei: this.imei }, position);
    }

    async checkEvents() {
        if (!(await this.setLastPosition())) return;

        const { siege, ignition, velocity, ignitionAndVelocity, siegeAndVelocity, points, pointsAndTime, anchor, theft } = this.eventsConfig;

        console.log("\nsiege______");
        if (await this.validateConfig(siege, 'siege') &&
            await this.checkSiege(siege))
            await Event.create({
                imei: this.imei,
                type: "siege"
            });

        console.log("\nignition______");
        if (await this.validateConfig(ignition, 'ignition') &&
            await this.checkIgnition(ignition))
            await Event.create({
                imei: this.imei,
                type: "ignition"
            });

        console.log("\nvelocity______");
        if (await this.validateConfig(velocity, 'velocity') &&
            await this.checkVelocity(velocity))
            await Event.create({
                imei: this.imei,
                type: "velocity"
            });

        console.log("\nignitionAndVelocity______");
        if (await this.validateConfig(ignitionAndVelocity, 'ignitionAndVelocity') &&
            await this.checkVelocity(ignitionAndVelocity) &&
            await this.checkIgnition(ignitionAndVelocity))
            await Event.create({
                imei: this.imei,
                type: "ignitionAndVelocity"
            });

        console.log("\nsiegeAndVelocity");
        if (await this.validateConfig(siegeAndVelocity, 'siegeAndVelocity') &&
            await this.checkVelocity(siegeAndVelocity) &&
            await this.checkSiege(siegeAndVelocity))
            await Event.create({
                imei: this.imei,
                type: "siegeAndVelocity"
            });

        console.log("\npoints");
        if (await this.validateConfig(points, 'points') &&
            await this.checkPoints(points))
            await Event.create({
                imei: this.imei,
                type: "points"
            });

        console.log("\npointsAndTime");
        if (await this.validateConfig(pointsAndTime, 'pointsAndTime') &&
            await this.checkPoints(pointsAndTime)) {
            amqp.connect('amqp://localhost:5672', (error, conn) => {
                if (error) console.log(error);
                conn.createChannel((error, ch) => {
                    if (error) console.log(error);

                    ch.publish('delay-exchange', '',
                        Buffer.from(JSON.stringify({ imei: this.imei, checkPoint: this.checkPoint })), { headers: { 'x-delay': pointsAndTime.time.toString() } }
                    );
                    console.log(`Time ativado para ${pointsAndTime.time}ms`);
                });
            });
        }

        this.checkAnchor(anchor);
        this.checkTheft(theft);
    }

    async validateConfig(config, type) {
        if (!config) {
            console.log(`${type} não configurado`);
            return false;
        };

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
            console.log("Dentro do raio!");
            if (!_in) return console.log("_in desativado!");
            if (!continuous && isLastPositionInside) return console.log("1x tipo habilitado e já estava dentro do raio");

            console.log("Points ok");
            return true;
        } else {
            console.log("Fora do raio!");
            if (!_out) return console.log("_out desativado!");
            if (!continuous && !isLastPositionInside) return console.log("1x tipo habilitado e já estava fora do raio");

            console.log("Points ok");
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
            if (!_in) return;

            await Event.create({
                imei,
                type: "pointsAndTime"
            });
            console.log("pointsAndTime criado");
            return;
        }
        if (!_out) return;

        await Event.create({
            imei,
            type: "pointsAndTime"
        });
        console.log("pointsAndTime criado");
    }

    async checkVelocity(config) {
        const { velocity, operator, continuous } = config;

        if (operator === "greaterOrEq" && this.velocity >= velocity) {
            console.log("greaterOrEq");
            if (!continuous && this.lastVelocity > velocity) return console.log("1x tipo habilitado e ultima velocidade maior ou igual a estipulada");

            console.log("Velocity ok");
            return true;
        } else if (operator === "lessThan" && this.velocity < velocity) {
            console.log("lessThan");

            if (!continuous && this.lastVelocity < velocity) return console.log("1x tipo habilitado e ultima velocidade menor que a estipulada");

            console.log("Velocity ok");
            return true;
        }
    }

    async checkIgnition(config) {
        const { on, off, continuous } = config;

        if (this.ignition) {
            if (!on) return false;
            if (!continuous && this.lastIgnition) return false;

            return true;
        }

        if (!off) return false;
        if (!continuous && !this.lastIgnition) return false;

        return true;
    }

    async checkSiege(config) {
        const { siege, _in, _out, continuous } = config;

        let lastSiege = isPointInPolygon(this.lastCoords, siege);
        let currentSiege = isPointInPolygon(this.coords, siege);

        if (currentSiege) {
            console.log("Veículo dentro da cerca");
            if (!_in) return console.log("_in desabilitado");
            if (!continuous && lastSiege) return console.log("1x tipo desabilitado ou Veículo dentro da cerca");

            console.log("Siege ok");
            return true;

        }
        console.log("Veículo fora da cerca");
        if (!_out) return console.log("_out desabilitado");
        if (!continuous && !lastSiege) return console.log("1x tipo desabilitado ou Veículo fora da cerca");

        console.log("Siege ok");
        return true;
    }

    async defaultConfigs(type, config) {
        const { active, initial_date, final_date, initial_time, final_time, suspend_till, schedule, once_a_day } = config;
        const today = new Date();

        if (!active) {
            console.log("Evento desativado!");
            return false;
        }

        if (!isWithinInterval(today, {
            start: parseISO(initial_date),
            end: parseISO(final_date)
        })) {
            console.log("Evento vencido!");
            return false;
        }

        const setTime = (time) => {
            const [hours, minutes] = time.split(":");
            const today = new Date();

            today.setHours(hours);
            today.setMinutes(minutes);

            return today;
        };

        if (!isWithinInterval(
            today,
            {
                start: setTime(initial_time),
                end: setTime(final_time)
            }
        )) {
            console.log("Evento fora do horário de funcionamento!");
            return false;
        }

        if (suspend_till && isAfter(parseISO(suspend_till), today)) {
            console.log("Evento suspenso!");
            return false;
        }

        if (schedule && !schedule.includes(format(new Date(), 'iiii'))) {
            console.log("Dia de funcionamento inválido!");
            return false;
        }

        if (once_a_day) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            const end = new Date();
            end.setHours(23, 59, 59, 999);
            const event = await Event.findOne({ imei: this.imei, type, createdAt: { $gte: start, $lt: end } });

            if (event) {
                console.log("Evento do dia já foi gerado");
                return false;
            };
        }

        return true;
    }

    async checkAnchor(config, radius = 20) {
        if (!config || !config.active) return false;

        if (!isPointWithinRadius(this.coords, config.point, 20))
            await Event.create({
                imei: this.imei,
                type: "anchor"
            });
    }

    async checkTheft(config) {
        if (!config || !config.active) return false;

        await Event.create({
            imei: this.imei,
            type: "theft"
        });

        const configs = { ...this.eventsConfig, theft: { active: false } };

        await LastPosition.updateOne({ imei: this.imei }, { events_config: configs });
    }

    async batteryFailure() {
        const { events_config } = await LastPosition.findOne({ imei });

        const { battery } = events_config;

        if (!battery) return console.log("Falha de bateria não configurada");

        const isValid = await this.defaultConfigs('battery', battery);

        if (!isValid) return;

        await Event.create({
            imei: this.imei,
            type: "battery"
        });

        console.log("Evento gerado");
    }
}

export default new Events();