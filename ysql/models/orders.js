const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return orders.init(sequelize, DataTypes);
}

class orders extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    o_w_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'customers',
        key: 'c_w_id'
      }
    },
    o_d_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'customers',
        key: 'c_w_id'
      }
    },
    o_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    o_ol_cnt: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    o_entry_d: {
      type: DataTypes.DATE,
      allowNull: true
    },
    o_carrier_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    o_c_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'c_w_id'
      }
    },
    o_all_local: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'orders',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_order",
        unique: true,
        fields: [
          { name: "o_w_id" },
          { name: "o_d_id" },
          { name: "o_id" },
        ]
      },
    ]
  });
  }
}
