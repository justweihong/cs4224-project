const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return districts.init(sequelize, DataTypes);
}

class districts extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    d_w_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'warehouses',
        key: 'w_id'
      }
    },
    d_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    d_city: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    d_name: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    d_state: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    d_street_2: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    d_street_1: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    d_next_o_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    d_ytd: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    d_tax: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    d_zip: {
      type: DataTypes.CHAR(9),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'districts',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_district",
        unique: true,
        fields: [
          { name: "d_w_id" },
          { name: "d_id" },
        ]
      },
    ]
  });
  }
}
