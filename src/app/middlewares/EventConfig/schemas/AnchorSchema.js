import * as yup from 'yup';

const AnchorSchema = yup.object().shape({
    active: yup.boolean().required(),
    radius: yup.number().positive().default(20)
});

export default AnchorSchema;