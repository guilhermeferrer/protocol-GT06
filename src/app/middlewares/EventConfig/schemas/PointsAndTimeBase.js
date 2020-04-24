import * as yup from 'yup';

const PointsAndTimeBase = { time: yup.number().positive().required() };

export default PointsAndTimeBase;