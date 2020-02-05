class Command {
    update(req, res) {
        const { imei, type } = req.body;
        const { clients } = req;
        const client = clients.get(imei);
        if (!client) {
            return res.status(400).json({ error: "O equipamento informado não está comunicando com o servidor no momento" });
        }

        if (type === 'cut') {
            return res.json({ message: client.cutOilAndElectricity() });
        } else if (type === 'restore') {
            return res.json({ message: client.restoreOilAndElectricity() });
        }

        return res.status(400).json({ error: "Comando inválido!" });
    }
}

export default new Command();