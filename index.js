import net from 'net';
const server = net.createServer();

import './src/database/mongoose';
import GT06 from './src/app/protocols/gt06';
import createTree from 'functional-red-black-tree';
import Store from './src/app/lib/store';
import amqp from 'amqplib/callback_api';

const clients = new Store(createTree());

const { HOST, RABBITMQ_PORT, GT06_PORT } = process.env;

amqp.connect(`amqp://${HOST}:${RABBITMQ_PORT}`, (error, conn) => {
    if (error) console.log(error);
    conn.createChannel((error, ch) => {
        if (error) console.log(error);

        server.on('connection', (client) => {
            const adapter = new GT06(client, ch);
            client.on('data', (data) => {
                adapter.receivedData(data);
                if (!clients.get(adapter.getImei())) {
                    clients.add(adapter.getImei(), adapter);
                }
            });
            client.on('close', (data) => {
                if (adapter.getImei()) {
                    adapter.sendProtocolLog({ imei: adapter.getImei(), type: 'disconnected' });
                    clients.remove(adapter.getImei());
                }
            });
            client.on('error', (err) => {
                console.log(err);
            });
        });

    });
});

server.listen(GT06_PORT);