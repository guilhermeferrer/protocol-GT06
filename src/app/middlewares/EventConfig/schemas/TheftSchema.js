import * as yup from 'yup';

const TheftSchema = yup.object().shape({
    active: yup.boolean().required()
});

export default TheftSchema;