import Sequelize from 'sequelize';
import postgresConfig from '../configs/postgres';
import Position from '../app/models/Position';
import LastPosition from '../app/models/LastPosition';
import Anchor from '../app/models/Anchor';
import Event from '../app/models/Event';

const connection = new Sequelize(postgresConfig);

Position.init(connection);
LastPosition.init(connection);
Anchor.init(connection);
Event.init(connection);

LastPosition.associate(connection.models);
Anchor.associate(connection.models);

export default connection;