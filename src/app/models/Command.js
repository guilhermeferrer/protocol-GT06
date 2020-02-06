import { Model, DataTypes } from 'sequelize';

class Command extends Model{
    static init(sequelize){
        super.init({
            imei: DataTypes.STRING,
            identifier: DataTypes.STRING,
            command: DataTypes.STRING,
            type: DataTypes.STRING,
            status: DataTypes.STRING
        }, {
            sequelize
        });
    }
}

export default Command;