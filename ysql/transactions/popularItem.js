const { Op, fn, col } = require("sequelize-yugabytedb");
sequelize = require("../sequelize");
const {
  districts,
  orders,
  order_lines,
  items,
  customers,
} = require("../sequelize");

const getPopularItems = async (w_id = 5, d_id = 1, l = 5) => {
  console.log(`(${w_id}, ${d_id})`);

  const { d_next_o_id: n } = await districts.findOne({
    where: { d_w_id: w_id, d_id },
    attributes: ["d_next_o_id"],
    raw: true,
    logging: false,
  });

  console.log(l);

  const orderRes = await orders.findAll({
    where: {
      o_d_id: d_id,
      o_w_id: w_id,
      o_id: { [Op.gte]: n - l },
    },
    raw: true,
    logging: false,
  });

  for (const o of orderRes) {
    const { c_first, c_middle, c_last } = await customers.findOne({
      attributes: ["c_first", "c_middle", "c_last"],
      where: { c_id: o.o_c_id },
      raw: true,
      logging: false,
    });

    console.log(`O_ID: ${o.o_id}, O_ENTRY_D: ${o.o_entry_d}`);
    console.log(`CUSTOMER NAME: ${c_first} ${c_middle} ${c_last}`);
  }

  o_ids = orderRes.map(({ o_id }) => o_id);

  const orderLineQuantities = await order_lines.findAll({
    attributes: ["ol_i_id", [fn("sum", col("ol_quantity")), "quantity"]],
    where: {
      ol_o_id: o_ids,
      ol_d_id: d_id,
      ol_w_id: w_id,
    },
    group: ["ol_i_id"],
    raw: true,
    logging: false,
  });

  const popularItems = orderLineQuantities.reduce(
    (map, { ol_i_id, quantity }) => {
      quantity = parseInt(quantity);

      if (quantity === map.quantity) {
        map.items.push(ol_i_id);
      } else if (quantity > map.quantity) {
        map.quantity = quantity;
        map.items = [ol_i_id];
      }

      return map;
    },
    { quantity: 0, items: [] }
  );

  console.log(popularItems);

  for (const i_id of popularItems.items) {
    const res = await order_lines.count({
      where: {
        ol_o_id: o_ids,
        ol_d_id: d_id,
        ol_w_id: w_id,
        ol_i_id: i_id,
      },
      group: ["ol_o_id"],
      raw: true,
      logging: false,
    });

    const { i_name } = await items.findOne({
      attributes: ["i_name"],
      where: {
        i_id: i_id,
      },
      raw: true,
      logging: false,
    });

    console.log(i_name, res.pop().count / l);
  }

  process.exit(0);
};

getPopularItems();
