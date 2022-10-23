const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return warehouses.init(sequelize, DataTypes);
}

class warehouses extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    w_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    w_tax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    w_street_1: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    w_street_2: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    w_name: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    w_zip: {
      type: DataTypes.CHAR(9),
      allowNull: true
    },
    w_ytd: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    w_state: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    w_city: {
      type: DataTypes.STRING(20),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'warehouses',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_warehouse",
        unique: true,
        fields: [
          { name: "w_id" },
        ]
      },
    ]
  });
  }
}
