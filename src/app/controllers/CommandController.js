import Command from '../models/Command';
import crc from 'node-crc-itu';


class CommandController {
    async update(req, res) {
        const { imei, command } = req.body;
        const { clients } = req;
        const client = clients.get(imei);

        if (!client) {
            return res.status(400).json({ error: "O equipamento informado não está comunicando com o servidor no momento" });
        }

        const id = crc(Math.random() * 100) + crc(new Date());

        const response = await Command.create({
            id,
            imei,
            command
        });

        if (command === 'cut') {
            return res.json({ message: client.cutOilAndElectricity(id) });
        } else if (command === 'restore') {
            return res.json({ message: client.restoreOilAndElectricity(id) });
        }

        return res.status(400).json({ error: "Comando inválido!" });
    }
}

export default new CommandController();