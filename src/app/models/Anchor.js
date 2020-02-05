import { Model, DataTypes } from 'sequelize';

class Anchor extends Model{
    static init(sequelize){
        super.init({
            anchor: DataTypes.JSON,
            imei: DataTypes.STRING
        }, {
            sequelize
        });
    }

    static associate(models){
        this.belongsTo(models.LastPosition, { foreignKey: 'imei' });
    }
}

export default Anchor;