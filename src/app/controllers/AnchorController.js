import LastPosition from '../models/LastPosition';

class AnchorController {
    async create(req, res) {
        const { imei, activated, radius = 20 } = req.body;

        const lastPosition = await LastPosition.findByPk(imei, { attributes: ['longitude', 'latitude'] });

        if (!lastPosition) {
            return res.status(400).json({ error: "Imei não encontrado!" });
        }

        const { latitude, longitude } = lastPosition;

        return res.json({ latitude, longitude, radius });
    }
}

export default new AnchorController();