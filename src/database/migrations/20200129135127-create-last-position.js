'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('last_positions', {
      imei: {
        type: Sequelize.STRING, 
        primaryKey: true,
        allowNull: false,
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
    return queryInterface.dropTable('last_positions');
  }
};