import { Router } from 'express';

// import AnchorController from './app/controllers/AnchorController';
import LastPositionController from './app/controllers/LastPositionController';
import PositionController from './app/controllers/PositionController';
import EventConfigController from './app/controllers/EventConfigController';
import CommandController from './app/controllers/CommandController';
import LinkController from './app/controllers/LinkController';

export default (clients) => {
    const routes = new Router();

    routes.post('/command', (req, res, next) => {
        req.clients = clients;
        next();
    }, CommandController.update);
    routes.get('/last-position', LastPositionController.show);
    routes.post('/event/configs', LastPositionController.update);
    routes.post('/positions', PositionController.index);
    routes.post('/events-config', EventConfigController.store);
    routes.put('/events-config/link', LinkController.update);
    routes.delete('/events-config/link', LinkController.delete);
    // routes.post('/anchor', AnchorController.create);

    return routes;
}