import { createLogger, transports, format } from 'winston';

const logger = createLogger({
    transports: [
        new transports.Http({
            level: 'info',
            port: 8082,
            path: '/info',
            format: format.combine(format.timestamp(), format.json())
        })
    ]
});

export default logger;