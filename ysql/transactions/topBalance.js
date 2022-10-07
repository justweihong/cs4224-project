const { customers, warehouses, districts } = require("../sequelize");

const getTopBalance = async () => {
  const res = await customers.findAll({
    limit: 10,
    order: [["c_balance", "DESC"]],
    logging: false,
  });

  for (let { c_first, c_middle, c_last, c_balance, c_w_id, c_d_id } of res) {
    const { w_name } = await warehouses.findByPk(c_w_id, { logging: false });
    const { d_name } = await districts.findByPk(c_d_id, { logging: false });

    console.log(`${(c_first, c_middle, c_last)}: ${c_balance}`);
    console.log(`Warehouse: ${w_name}`);
    console.log(`District: ${d_name}`);
  }

};

module.exports = { getTopBalance };
