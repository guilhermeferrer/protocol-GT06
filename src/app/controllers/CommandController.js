import Command from '../models/Command';
import crc from 'node-crc-itu';


class CommandController {
    async update(req, res) {
        const { imei, command } = req.body;
        const { clients } = req;
        const client = clients.get(imei);

        const identifier = crc(Math.random() * 100) + crc(new Date());

        const response = await Command.create({
            imei,
            command,
            identifier,
            type: 'request',
            status: 'Comando enviado'
        });

        if (!client) {
            return res.status(400).json({ error: "O equipamento informado não está comunicando com o servidor no momento" });
        }

        if (command === 'cut') {
            return res.json({ message: client.cutOilAndElectricity(identifier) });
        } else if (command === 'restore') {
            return res.json({ message: client.restoreOilAndElectricity(identifier) });
        }

        return res.status(400).json({ error: "Comando inválido!" });
    }
}

export default new CommandController();