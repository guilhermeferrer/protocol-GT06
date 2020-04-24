import DefaultSchema from './DefaultSchema';
import AnchorSchema from './AnchorSchema';
import TheftSchema from './TheftSchema';

import SiegeBase from './SiegeBase';
import VelocityBase from './VelocityBase';
import IgnitionBase from './IgnitionBase';
import SiegeBase from './SiegeBase';
import PointsBase from './PointsBase';
import PointsAndTimeBase from './PointsAndTimeBase';

const VelocitySchema = DefaultSchema.shape(VelocityBase);
const IgnitionSchema = DefaultSchema.shape(IgnitionBase).shape(SiegeBase);
const SiegeSchema = DefaultSchema.shape(SiegeBase);
const SiegeAndVelocitySchema = DefaultSchema.shape(VelocityBase).shape(SiegeBase);
const IgnitionAndVelocitySchema = DefaultSchema.shape(IgnitionBase).shape(SiegeBase);
const PointsSchema = DefaultSchema.shape(PointsBase);
const PointsAndTimeSchema = DefaultSchema.shape(PointsBase).shape(PointsAndTimeBase);

export {
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
};