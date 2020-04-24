import { 
    DefaultSchema, 
    SiegeSchema, 
    VelocitySchema, 
    IgnitionSchema, 
    SiegeAndVelocitySchema, 
    IgnitionAndVelocitySchema,
    PointsSchema,
    PointsAndTimeSchema,
    AnchorSchema,
    TheftSchema
} from './schemas/index';

export default async function (req, res, next) {
    const { type } = req.body;

    const isTypeValid = events[type];

    if (!isTypeValid)
        return res.status(400).json({ error: 'Tipo do evento inválido.' });

    events[type]({req, res, next});
}

const events = {
    siege(config) {
        checkError(SiegeSchema, config);
    },
    ignition(config) {
        checkError(IgnitionSchema, config);
    },
    velocity(config) {
        checkError(VelocitySchema, config);
    },
    siegeAndVelocity(config) {
        checkError(SiegeAndVelocitySchema, config);
    },
    ignitionAndVelocity(config) {
        checkError(IgnitionAndVelocitySchema, config);
    },
    points(config) {
        checkError(PointsSchema, config);
    },
    pointsAndTime(config) {
        checkError(PointsAndTimeSchema, config);
    },
    anchor(config) {
        checkError(AnchorSchema, config);
    },
    theft(config) {
        checkError(TheftSchema, config);
    },
    panic(config) {
        checkError(null, config);
    },
    battery(config) {
        checkError(null, config);
    }
}

async function checkError(Schema = DefaultSchema, config) {
    const { req, res, next } = config;
    await Schema.validate(req.body).then(() => next()).catch(err => {
        return res.status(400).json({ error: err.errors[0] });
    });
}