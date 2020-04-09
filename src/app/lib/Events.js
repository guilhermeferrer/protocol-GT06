import { isPointInPolygon, isPointWithinRadius } from 'geolib';
import { format, isAfter, isWithinInterval, parseISO } from 'date-fns';
import Event from '../models/Event';
import LastPosition from '../models/LastPosition';

class Events {
    async checkEvents(position, imei) {
        const lastPosition = await LastPosition.findOne({ imei });

        const { events_config } = lastPosition;

        if (Object.keys(events_config).length === 0) return console.log("Eventos não configurados!");

        const { siege, ignition, velocity } = events_config;

        this.checkSiege(imei, siege, position, lastPosition);
        this.checkIgnition(imei, ignition, position.ignition, lastPosition.ignition);
        this.checkVelocity(imei, velocity, position.velocity, lastPosition.velocity);
    }

    async checkVelocity(imei, config, currentVelocity, lastVelocity) {
        if (!config) return console.log("Velocidade não configurada");

        const isValid = await this.defaultConfigs(imei, 'velocity', config);

        if (!isValid) return;

        const { velocity, operator, continuous } = config;

        if (operator === "greaterOrEq" && currentVelocity >= velocity) {
            console.log("greaterOrEq");
            if (!continuous && lastVelocity > velocity) return console.log("1x tipo habilitado e ultima velocidade maior ou igual a estipulada");

            await Event.create({
                imei,
                type: "velocity"
            });

            console.log("Evento gerado");
        } else if (operator === "lessThan" && currentVelocity < velocity) {
            console.log("lessThan");

            if (!continuous && lastVelocity < velocity) return console.log("1x tipo habilitado e ultima velocidade menor que a estipulada");

            await Event.create({
                imei,
                type: "velocity"
            });

            console.log("Evento gerado");
        }
    }

    async checkIgnition(imei, config, ignition, lastIgnition) {
        if (!config) return console.log("Ignição não configurado");

        const isValid = await this.defaultConfigs(imei, 'ignition', config);

        if (!isValid) return;

        const { on, off, continuous } = config;

        if (ignition) {
            console.log("Ignição ligada");
            if (!on) return console.log("On desabilitado");
            if (!continuous && lastIgnition) return console.log("1x tipo habilitado e ultima ignição igual a atual");

            await Event.create({
                imei,
                type: "ignition"
            });

            console.log("Evento gerado");
        } else {
            console.log("Ignição desligada");
            if (!off) return console.log("Off desabilitado");
            if (!continuous && !lastIgnition) return console.log("1x tipo habilitado e ultima ignição igual a atual");

            await Event.create({
                imei,
                type: "ignition"
            });

            console.log("Evento gerado");
        }

    }

    async defaultConfigs(imei, type, config) {
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
            const event = await Event.findOne({ imei, type, createdAt: { $gte: start, $lt: end } });

            if (event) {
                console.log("Evento do dia já foi gerado");
                return false;
            };
        }

        return true;
    }

    async batteryFailure(imei) {
        const { events_config } = await LastPosition.findOne({ imei });

        const { battery } = events_config;

        if (!battery) return console.log("Falha de bateria não configurada");

        const isValid = await this.defaultConfigs(imei, 'battery', battery);

        if (!isValid) return;

        await Event.create({
            imei: imei,
            type: "battery"
        });

        console.log("Evento gerado");
    }

    async checkSiege(imei, config, position, lastPosition) {
        if (!config) return console.log("Cerco não configurado");

        const isValid = await this.defaultConfigs(imei, 'siege', config);

        if (!isValid) return;

        const { siege, _in, _out, continuous } = config;

        let lastSiege = isPointInPolygon({ latitude: lastPosition.latitude, longitude: lastPosition.longitude }, siege);
        let currentSiege = isPointInPolygon(position, siege);

        if (currentSiege) {
            console.log("Veículo dentro da cerca");
            if (!_in) return console.log("_in desabilitado");
            if (!continuous && lastSiege) return console.log("1x tipo desabilitado ou Veículo dentro da cerca");

            await Event.create({
                imei,
                type: "siege"
            });
            console.log("Evento gerado");

        } else {
            console.log("Veículo fora da cerca");
            if (!_out) return console.log("_out desabilitado");
            if (!continuous && !lastSiege) return console.log("1x tipo desabilitado ou Veículo fora da cerca");

            await Event.create({
                imei,
                type: "siege"
            });
            console.log("Evento gerado");
        }
    }

    async checkAnchor({ latitude, longitude }) {
        const { point } = await Anchor.findOne({ imei: this.imei });

        console.log(point);
        const position = [latitude, longitude];

        if (!isPointWithinRadius(position, point, 20)) {
            await Event.create({
                imei: this.imei,
                type: "Âncoragem"
            });
        } else {
            console.log("!Âncoragem");
        }

        this.anchor = true;
    }
}

export default new Events();