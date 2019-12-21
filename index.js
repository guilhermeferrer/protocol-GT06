const net = require('net');

const server = net.createServer();

server.on('connection', (client) => {
    console.log("SERVER %j", server.address());
    console.log("New connection " + client.remoteAddress + ":" + client.remotePort);

    client.on('data', (data) => {
        console.log("New Message " + data);
    })
});

server.listen(process.env.PORT || 3000);