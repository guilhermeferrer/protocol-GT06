import LastPosition from '../models/LastPosition';
import Siege from '../models/Siege';

class SiegeController {
    async create(req, res) {
        const { siege, imei } = req.body;

        const updateAnchor = await Siege.update({
            siege
        }, {
            where: { imei }
        });

        if (updateAnchor[0] === 0) {
            const newAnchor = await Siege.create({ siege, imei });

            return res.json({ message: "Cerco criado com sucesso!" });
        }

        return res.json({ message: "Cerco atualizado com sucesso!" });
    }

    async update(req, res) {
        const { imei, activated } = req.body;

        await LastPosition.update({ siege: activated }, { where: { imei } });

        return res.json({ message: `Cerco ${activated ? "ativado" : "desativado"} com sucesso!` });
    }
}

export default new SiegeController();