import LastPosition from '../models/LastPosition';
import Anchor from '../models/Anchor';

class SiegeController {
    async create(req, res) {
        const { anchor, imei } = req.body;

        const updateAnchor = await Anchor.update({
            anchor
        }, {
            where: { imei }
        });

        if (updateAnchor[0] === 0) {
            const newAnchor = await Anchor.create({ anchor, imei });

            return res.json({ message: "Cerco criado com sucesso!" });
        }

        return res.json({ message: "Cerco atualizado com sucesso!" });
    }

    async update(req, res) {
        const { imei, activated } = req.body;

        await LastPosition.update({ anchor: activated }, { where: { imei } });

        return res.json({ message: `Cerco ${activated ? "ativado" : "desativado"} com sucesso!` });
    }
}

export default new SiegeController();