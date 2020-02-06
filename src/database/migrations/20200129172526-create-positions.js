'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('positions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      imei: {
        type: Sequelize.STRING        
      },
      latitude: {
        type: Sequelize.STRING,
      },
      longitude: {
        type: Sequelize.STRING,
      },
      velocity: {
        type: Sequelize.DECIMAL,
      },
      gps_date: {
        type: Sequelize.STRING,
      },
      ignition: {
        type: Sequelize.BOOLEAN,
      },
      electricity: {
        type: Sequelize.BOOLEAN,
      },
      anchor: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      siege: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('positions');
  }
};
