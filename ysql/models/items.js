const Sequelize = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  return items.init(sequelize, DataTypes);
}

class items extends Sequelize.Model {
  static init(sequelize, DataTypes) {
  return super.init({
    i_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    i_name: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    i_price: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    i_im_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    i_data: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'items',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_item",
        unique: true,
        fields: [
          { name: "i_id" },
        ]
      },
    ]
  });
  }
}
