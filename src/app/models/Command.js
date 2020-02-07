import { Model, DataTypes } from 'sequelize';

class Command extends Model{
    static init(sequelize){
        super.init({
            id: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            imei: DataTypes.STRING,
            command: DataTypes.STRING,
            status: {
                type: DataTypes.STRING,
                defaultValue: "Sem resposta"
            }
        }, {
            sequelize
        });
    }
}

export default Command;