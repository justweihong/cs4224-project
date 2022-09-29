const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return stocks.init(sequelize, DataTypes);
}

class stocks extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    s_w_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'warehouses',
        key: 'w_id'
      }
    },
    s_i_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'items',
        key: 'i_id'
      }
    },
    s_order_cnt: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    s_dist_10: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_dist_07: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_dist_04: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_dist_01: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_dist_02: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_ytd: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    s_dist_06: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_remote_cnt: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    s_dist_08: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_dist_09: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_dist_05: {
      type: DataTypes.CHAR(24),
      allowNull: true
    },
    s_quantity: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    s_data: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    s_dist_03: {
      type: DataTypes.CHAR(24),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'stocks',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_stock",
        unique: true,
        fields: [
          { name: "s_w_id" },
          { name: "s_i_id" },
        ]
      },
    ]
  });
  }
}
