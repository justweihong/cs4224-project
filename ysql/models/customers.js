const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return customers.init(sequelize, DataTypes);
}

class customers extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    c_w_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'districts',
        key: 'd_w_id'
      }
    },
    c_d_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'districts',
        key: 'd_w_id'
      }
    },
    c_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    c_delivery_cnt: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c_zip: {
      type: DataTypes.CHAR(9),
      allowNull: true
    },
    c_street_2: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    c_street_1: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    c_last: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    c_balance: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    c_credit: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    c_ytd_payment: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    c_state: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    c_middle: {
      type: DataTypes.CHAR(2),
      allowNull: true
    },
    c_city: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    c_payment_cnt: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    c_phone: {
      type: DataTypes.CHAR(16),
      allowNull: true
    },
    c_discount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    c_credit_limit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    c_data: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    c_first: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    c_since: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'customers',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_customer",
        unique: true,
        fields: [
          { name: "c_w_id" },
          { name: "c_d_id" },
          { name: "c_id" },
        ]
      },
    ]
  });
  }
}
