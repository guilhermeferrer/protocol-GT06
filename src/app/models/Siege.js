import { Model, DataTypes } from 'sequelize';

class Siege extends Model{
    static init(sequelize){
        super.init({
            siege: DataTypes.JSON,
            imei: DataTypes.STRING
        }, {
            sequelize
        });
    }

    static associate(models){
        this.belongsTo(models.LastPosition, { foreignKey: 'imei' });
    }
}

export default Siege;