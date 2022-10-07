const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return order_lines.init(sequelize, DataTypes);
}

class order_lines extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    ol_w_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'orders',
        key: 'o_w_id'
      }
    },
    ol_d_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'orders',
        key: 'o_w_id'
      }
    },
    ol_o_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'orders',
        key: 'o_w_id'
      }
    },
    ol_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ol_supply_w_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ol_amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ol_quantity: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    ol_dist_info: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    ol_i_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'items',
        key: 'i_id'
      }
    },
    ol_delivery_d: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'order_lines',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_order_line",
        unique: true,
        fields: [
          { name: "ol_w_id" },
          { name: "ol_d_id" },
          { name: "ol_o_id" },
          { name: "ol_number" },
        ]
      },
    ]
  });
  }
}
