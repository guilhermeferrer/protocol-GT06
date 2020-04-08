import net from 'net';
const server = net.createServer();
import express from 'express';
import cors from 'cors';

import './src/database/mongoose';
import GT06 from './src/app/protocols/gt06';
import routes from './src/routes';
import createTree from 'functional-red-black-tree';
import Store from './src/app/lib/store';

const clients = new Store(createTree());

const api = express();

api.use(express.json());
api.use(cors());
api.use(routes(clients));

server.on('connection', (client) => {
    const adapter = new GT06(client);
    client.on('data', (data) => {
        adapter.receivedData(data);
        if (!clients.get(adapter.getImei())) {
            clients.add(adapter.getImei(), adapter);
        }
    });
    client.on('close', (data) => {
        clients.remove(adapter.getImei());
        console.log('disconnected');
    });
});

api.listen(8081);
server.listen(3333);