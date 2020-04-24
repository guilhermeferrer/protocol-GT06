import { isAfter, format, parseISO } from 'date-fns';
import * as yup from 'yup';

const DefaultSchema = yup.object().shape({
    once_a_day: yup.boolean().required(),
    continuous: yup.boolean().required(),
    active: yup.boolean().required(),
    schedule: yup.array().required().of(yup.string().matches(/(?:[\s]|^)(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?=[\s]|$)/)),
    priority: yup.string().required().matches(/(Alta|Baixa|Média)/),
    suspend_till: yup.date().min(yup.ref('initial_date')),
    final_time: yup.string().required().min(5).max(5).test('timeDistance', 'Hora final deve ser maior que hora inicial', function (final_time) {

        const { initial_time } = this.options.parent;
        const initialDate = parseISO(`2020-01-01T${initial_time}:00.000+00:00`);
        const finalDate = parseISO(`2020-01-01T${final_time}:00.000+00:00`);

        if (isAfter(finalDate, initialDate)) return true;
        return false;
    }),
    initial_time: yup.string().required().min(5).max(5),
    final_date: yup.date().required().min(yup.ref('initial_date')),
    initial_date: yup.date().required(),
    description: yup.string().required(),
});

export default DefaultSchema;