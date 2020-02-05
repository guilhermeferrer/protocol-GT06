import { Model, DataTypes } from 'sequelize';

class Event extends Model{
    static init(sequelize){
        super.init({
            imei: DataTypes.STRING,
            type: DataTypes.STRING
        }, {
            sequelize
        });
    }
}

export default Event;