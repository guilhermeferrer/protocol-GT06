import * as yup from 'yup';

const PointsBase = {
    points: yup.array().required(),
    _in: yup.boolean().required(),
    _out: yup.boolean().required(),
    radius: yup.number().required().positive()
};

export default PointsBase;