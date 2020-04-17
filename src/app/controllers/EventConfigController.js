import EventConfig from '../models/EventConfig';

class EventConfigController {
    async store(req, res) {
        const { organization, entity, events_config } = req.body;

        if (!events_config || !entity)
            return res.status(400).json({ error: 'Entidade ou configurações de eventos não informados' });

        const eventConfig = await EventConfig.create({ entity, events_config });

        return res.json(eventConfig);
    }
}

export default new EventConfigController();