const DataTypes = require("sequelize").DataTypes;
const _customers = require("./customers");
const _districts = require("./districts");
const _items = require("./items");
const _order_lines = require("./order_lines");
const _orders = require("./orders");
const _stocks = require("./stocks");
const _warehouses = require("./warehouses");

function initModels(sequelize) {
  const customers = _customers(sequelize, DataTypes);
  const districts = _districts(sequelize, DataTypes);
  const items = _items(sequelize, DataTypes);
  const order_lines = _order_lines(sequelize, DataTypes);
  const orders = _orders(sequelize, DataTypes);
  const stocks = _stocks(sequelize, DataTypes);
  const warehouses = _warehouses(sequelize, DataTypes);

  customers.belongsToMany(customers, { as: 'o_w_id_customers', through: orders, foreignKey: "o_d_id", otherKey: "o_w_id" });
  customers.belongsToMany(customers, { as: 'o_d_id_customers', through: orders, foreignKey: "o_w_id", otherKey: "o_d_id" });
  districts.belongsToMany(districts, { as: 'c_w_id_districts', through: customers, foreignKey: "c_d_id", otherKey: "c_w_id" });
  districts.belongsToMany(districts, { as: 'c_d_id_districts', through: customers, foreignKey: "c_w_id", otherKey: "c_d_id" });
  items.belongsToMany(warehouses, { as: 's_w_id_warehouses', through: stocks, foreignKey: "s_i_id", otherKey: "s_w_id" });
  warehouses.belongsToMany(items, { as: 's_i_id_items', through: stocks, foreignKey: "s_w_id", otherKey: "s_i_id" });
  orders.belongsTo(customers, { as: "o_c", foreignKey: "o_c_id"});
  customers.hasMany(orders, { as: "orders", foreignKey: "o_c_id"});
  orders.belongsTo(customers, { as: "o_d", foreignKey: "o_d_id"});
  customers.hasMany(orders, { as: "o_d_orders", foreignKey: "o_d_id"});
  orders.belongsTo(customers, { as: "o_w", foreignKey: "o_w_id"});
  customers.hasMany(orders, { as: "o_w_orders", foreignKey: "o_w_id"});
  customers.belongsTo(districts, { as: "c_d", foreignKey: "c_d_id"});
  districts.hasMany(customers, { as: "customers", foreignKey: "c_d_id"});
  customers.belongsTo(districts, { as: "c_w", foreignKey: "c_w_id"});
  districts.hasMany(customers, { as: "c_w_customers", foreignKey: "c_w_id"});
  order_lines.belongsTo(items, { as: "ol_i", foreignKey: "ol_i_id"});
  items.hasMany(order_lines, { as: "order_lines", foreignKey: "ol_i_id"});
  stocks.belongsTo(items, { as: "s_i", foreignKey: "s_i_id"});
  items.hasMany(stocks, { as: "stocks", foreignKey: "s_i_id"});
  order_lines.belongsTo(orders, { as: "ol_d", foreignKey: "ol_d_id"});
  orders.hasMany(order_lines, { as: "order_lines", foreignKey: "ol_d_id"});
  order_lines.belongsTo(orders, { as: "ol_o", foreignKey: "ol_o_id"});
  orders.hasMany(order_lines, { as: "ol_o_order_lines", foreignKey: "ol_o_id"});
  order_lines.belongsTo(orders, { as: "ol_w", foreignKey: "ol_w_id"});
  orders.hasMany(order_lines, { as: "ol_w_order_lines", foreignKey: "ol_w_id"});
  districts.belongsTo(warehouses, { as: "d_w", foreignKey: "d_w_id"});
  warehouses.hasMany(districts, { as: "districts", foreignKey: "d_w_id"});
  stocks.belongsTo(warehouses, { as: "s_w", foreignKey: "s_w_id"});
  warehouses.hasMany(stocks, { as: "stocks", foreignKey: "s_w_id"});

  return {
    customers,
    districts,
    items,
    order_lines,
    orders,
    stocks,
    warehouses,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
