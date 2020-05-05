const amqp = require('amqplib/callback_api');
import Events from './src/app/lib/Events';
import './src/database/mongoose';

amqp.connect('amqp://localhost:5672', (error, conn) => {
    if (error) console.log(error);
    conn.createChannel((error, ch) => {
        if (error) console.log(error);

        ch.consume('positions', msg => {
            Events.storePosition(JSON.parse(msg.content));
        }, { noAck: true });

        ch.consume('points-and-time', msg => {
            Events.checkPointsAndTime(JSON.parse(msg.content));
        }, { noAck: true });
    });
});

//https://gist.github.com/mfressdorf/f46fdf266f35d8c525aea16719f837ac