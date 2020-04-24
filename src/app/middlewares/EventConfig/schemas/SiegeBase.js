import * as yup from 'yup';

const SiegeBase = {
    _out: yup.boolean().required(),
    _in: yup.boolean().required(),
    siege: yup.array().required().of(yup.array())
};

export default SiegeBase;