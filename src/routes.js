import { Router } from 'express';

import AnchorController from './app/controllers/AnchorController';
import LastPositionController from './app/controllers/LastPositionController';
import PositionController from './app/controllers/PositionController';
import SiegeController from './app/controllers/SiegeController';
import CommandController from './app/controllers/CommandController';

export default (clients) => {
    const routes = new Router();

    routes.post('/command', (req, res, next) => {
        req.clients = clients;
        next();
    }, CommandController.update);
    routes.get('/last-position', LastPositionController.show);
    routes.post('/event/configs', LastPositionController.update);
    routes.post('/positions', PositionController.index);
    routes.post('/anchor', AnchorController.create);

    return routes;
}