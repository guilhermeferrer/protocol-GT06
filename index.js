const net = require('net');

const server = net.createServer();

server.on('connection', (client) => {
    console.log("New connection " + client.remoteAddress + ":" + client.remotePort);

    client.on('data', (data) => {
        console.log("New Message " + data);
    })
});

server.listen(process.env.PORT || 3000, () => {
    console.log( "Executando servidor na porta: " + process.env.PORT || 3000);
});