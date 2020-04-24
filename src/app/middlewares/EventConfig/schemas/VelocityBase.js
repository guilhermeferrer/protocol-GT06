import * as yup from 'yup';

const VelocityBase = {
    operator: yup.string().required().matches(/(?:[\s]|^)(greaterOrEq|lessThan)(?=[\s]|$)/),
    velocity: yup.number().required().positive()
};

export default VelocityBase;