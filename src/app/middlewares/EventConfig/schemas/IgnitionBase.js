import * as yup from 'yup';

const IgnitionBase = {
    off: yup.boolean().required(),
    on: yup.boolean().required()
};

export default IgnitionBase;