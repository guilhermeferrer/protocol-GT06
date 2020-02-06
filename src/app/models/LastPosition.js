import { Model, DataTypes } from 'sequelize';

class LastPosition extends Model{
    static init(sequelize){
        super.init({
            latitude: DataTypes.STRING,
            longitude: DataTypes.STRING,
            velocity: DataTypes.DECIMAL,
            gps_date: DataTypes.STRING,
            imei: {
                type: DataTypes.STRING,
                primaryKey: true
            },
            ignition: DataTypes.BOOLEAN,
            electricity: DataTypes.BOOLEAN,
            anchor: DataTypes.BOOLEAN,
            siege: DataTypes.BOOLEAN
        }, {
            sequelize
        });
    }    
    
    static associate(models){
        this.hasOne(models.Anchor, { foreignKey: 'imei', as: 'anchoring' });
        this.hasOne(models.Siege, { foreignKey: 'imei', as: 'sieging' });
    }
}

export default LastPosition;