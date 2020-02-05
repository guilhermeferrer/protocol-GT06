import LastPosition from '../models/LastPosition';

class LastPositionController {
    async show(req, res) {
        const { imei } = req.query;

        const lastPosition = await LastPosition.findOne(
            {
                where: { imei },
                attributes: ['gps_date', 'latitude', 'longitude', 'velocity', 'ignition', 'electricity', 'anchor'],
                include: {
                    association: 'anchoring',
                    attributes: ['anchor']
                }
            }
        );

        if (!lastPosition) {
            return res.status(400).json({ error: "Imei não encontrado!" });
        }

        return res.json(lastPosition);
    }
}

export default new LastPositionController();