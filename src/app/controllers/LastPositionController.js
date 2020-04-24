import LastPosition from '../models/LastPosition';

class LastPositionController {
    async show(req, res) {
        const { imei } = req.query;

        const lastPosition = await LastPosition.findOne({ imei }).populate('events_config');

        if (!lastPosition) {
            return res.status(404).json({ error: "Imei não encontrado!" });
        }

        return res.json(lastPosition);
    }

    async update(req, res) {
        const { events_config, imei } = req.body;

        const lastPosition = await LastPosition.updateOne({ imei }, { events_config });

        return res.json(lastPosition);
    }
}

export default new LastPositionController();