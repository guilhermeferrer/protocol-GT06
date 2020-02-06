import Position from '../models/Position';

class PositionController {
    async index(req, res) {
        const { imei } = req.body;

        const positions = await Position.findAll(
            {
                where: { imei },
                limit: 15,
                attributes: ['gps_date', 'latitude', 'longitude', 'velocity', 'ignition', 'electricity', 'anchor'],
                order: [['created_at', 'desc']]
            }
        );

        return res.json(positions);
    }
}

export default new PositionController();