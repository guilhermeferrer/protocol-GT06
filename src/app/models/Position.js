import { Model, DataTypes } from 'sequelize';

class Position extends Model{
    static init(sequelize){
        super.init({
            latitude: DataTypes.STRING,
            longitude: DataTypes.STRING,
            velocity: DataTypes.DECIMAL,
            gps_date: DataTypes.STRING,
            imei: DataTypes.STRING,
            ignition: DataTypes.BOOLEAN,
            electricity: DataTypes.BOOLEAN,
            anchor: DataTypes.BOOLEAN
        }, {
            sequelize
        });
    }    
}

export default Position;