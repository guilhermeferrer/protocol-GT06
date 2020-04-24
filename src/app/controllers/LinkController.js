import LastPosition from '../models/LastPosition';

class LinkController {
    async update(req, res) {
        const { entity, imei, organization, _id } = req.body;

        if (!imei || !_id)
            return res.status(400).json({ error: 'Imei ou id da configuração não informados' });

        const update = await LastPosition.updateOne({ imei }, { events_config: _id });

        return res.json(update);
    }

    async delete(req, res) {
        const { imei } = req.body;

        if (!imei)
            return res.status(400).json({ error: 'Imei não informados' });

        const update = await LastPosition.updateOne({ imei }, { events_config: null });

        return res.json(update);
    }
}

export default new LinkController();