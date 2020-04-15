import Events from './Events';

import mongoose from 'mongoose';
import amqp from 'amqplib/callback_api';

// const position = {
//     imei: "860016022724731",
//     latitude: -17.20442574499004,
//     longitude: -46.87522888183594,
//     ignition: true,
//     electricity: true,
//     velocity: 0
// };

// amqp.connect('amqp://localhost:5672', (error, conn) => {
//     if (error) return;
//     console.log("Conexão criada!");
//     conn.createChannel((error, ch) => {
//         if (error) {
//             console.log(error);
//             return;
//         };
//         console.log("Canal aberto!");
//         ch.sendToQueue('position', Buffer.from(JSON.stringify(position)));
//     });
// });

amqp.connect('amqp://localhost:5672', (error, conn) => {
    if (error) return;
    console.log("Conexão criada!");
    conn.createChannel((error, ch) => {
        if (error) {
            console.log(error);
            return;
        };
        console.log("Canal aberto!");
        const delay = (3 * 60 * 1000).toString();
        ch.publish('delay-exchange', '', Buffer.from(new Date().toString()), { headers: { 'x-delay': delay } });
        console.log(new Date());
    });
});

// mongoose.connect('mongodb://localhost:27017/gateway', {
//     useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true
// });

// Events.checkEvents({
//     imei: "860016022724731",
//     latitude: -17.20442574499004,
//     longitude: -46.87522888183594,
//     ignition: true,
//     electricity: true,
//     velocity: 0
// });