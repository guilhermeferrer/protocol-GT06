# Protocol GT06

This repo is a microservice wich is responsible to decode and manage all incoming GT06 packages into a RabbitMQ queue. 

Checkout using the following command to start playing with the server:

```bash
> git clone https://github.com/guilhermeferrer/protocol-GT06/.git
```

Don't forget to install dependencies:
```bash
> cd protocol-GT06 && yarn
```

To start the server use:
```bash
yarn server
```
# Important
In order to successfully execute the server, you will need a RabbitMQ, Redis and MongoDB. Create a `.env` at root directory with the following information:

| KEY | VALUE |
| ------ | ------ |
| HOST | Host server's IP |
| RABBITMQ_PORT | Port number of your RabbitMQ service |
| GT06_PORT | Port number wich your server will be running |
| MONGODB_PORT | Port number of you MongoDB database |
| MONGODB_DATABASE | Name of your MongoDB database |
| MONGODB_USER | User of your MongoDB database  |
| MONGODB_PASSWD | Password of your MongoDB database |
| REDIS_PORT| Port number of your Redis database |
| REDIS_DATABASE| Name of your Redis database |
| REDIS_PASSWD| Password number of your Redis database |

