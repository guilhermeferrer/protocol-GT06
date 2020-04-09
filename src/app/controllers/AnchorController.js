// import LastPosition from '../models/LastPosition';
// import Anchor from '../models/Anchor';

// class AnchorController {
//     async create(req, res) {
//         const { imei, activated, radius = 20 } = req.body;

//         if(!activated){
//             await LastPosition.update({ anchor: false }, { where: { imei } });

//             return res.json({ message: "Âncoragem desabilitada!" });
//         }

//         const lastPosition = await LastPosition.findByPk(imei, { attributes: ['longitude', 'latitude'] });

//         if (!lastPosition) {
//             return res.status(400).json({ error: "Imei não encontrado!" });
//         }

//         const { latitude, longitude } = lastPosition;        

//         const updateAnchor = await Anchor.update({
//             point: [latitude, longitude]
//         }, {
//             where: { imei }
//         });

//         if (updateAnchor[0] === 0) {
//             await Anchor.create({
//                 imei,
//                 point: [latitude, longitude]
//             });
//         }

//         await LastPosition.update({ anchor: true }, { where: { imei } });

//         return res.json({ message: "Âncoragem ativada!" });
//     }
// }

// export default new AnchorController();