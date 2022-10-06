async function relatedCustomerTransaction(client, given_w_id, given_d_id, given_c_id) {
    try { 
      console.log('>>>> Given customer has warehouse %s, district %s and id %s.', given_w_id, given_d_id, given_c_id)
      console.log('>>>> Identifying customers related to given customer.');
      var stmt = `WITH givenCustomerOrders AS 
      (SELECT Order.o_w_id, Order.o_d_id, Order.o_id
      FROM Order
      WHERE o_c_id = ${given_c_id} AND o_d_id = ${given_d_id} AND o_w_id = ${given_w_id})
      
      SELECT OrderItem.ol_w_id, OrderItem.ol_d_id, OrderItem.ol_o_id, OrderItem.ol_i_id
      FROM OrderItem
      WHERE 
      OrderItem.ol_w_id = givenCustomerOrders.o_w_id AND
      OrderItem.ol_d_id = givenCustomerOrders.o_d_id AND
      OrderItem.ol_o_id = givenCustomerOrders.o_id`;

      const givenCustomerOrderLines = await client.query(stmt);
      console.log('>>>> Order lines for given customer procured.')

      stmt = `WITH otherCustomerOrders AS 
      (SELECT Order.o_w_id, Order.o_d_id, Order.o_id, Order.o_c_id
      FROM Order
      WHERE o_c_id != ${given_c_id} AND o_w_id != ${given_w_id})
      
      SELECT OrderItem.ol_w_id, OrderItem.ol_d_id, OrderItem.ol_o_id, OrderItem.ol_i_id, Order.o_c_id 
      FROM OrderItem
      JOIN Order
      ON (OrderItem.ol_w_id = Order.o_w_id AND OrderItem.ol_d_id = Order.o_d_id AND OrderItem.ol_o_id = Order.o_id)
      WHERE 
      OrderItem.ol_w_id = otherCustomerOrders.o_w_id AND
      OrderItem.ol_d_id = otherCustomerOrders.o_d_id AND
      OrderItem.ol_o_id = otherCustomerOrders.o_id`;

      const otherCustomerOrderLines = await client.query(stmt);
      console.log('>>>> Order lines for customers with foreign warehouses procured.')

      var commonItemOrders = new Map();
      var relatedCustomers = new Set();

      for (i = 0; i < otherCustomerOrderLines.rows.length; i++) {
        var otherCustomerOrderLine = otherCustomerOrderLines.rows[i];

        for (j = 0; j < givenCustomerOrderLines.rows.length; j++) {
          var givenCustomerOrderLine = givenCustomerOrderLines.rows[i];

          if(otherCustomerOrderLine.ol_i_id = givenCustomerOrderLine.ol_i_id) {
            var key = otherCustomerOrderLine.o_c_id.toString().concat("_", otherCustomerOrderLine.ol_o_id);
            var value = otherCustomerOrderLine.ol_i_id;
            if(commonItemOrders.has(key)) {
              if(commonItemOrders.get(key) != value) {
                var relatedCustomer = ''.concat('Related customer has warehouse ', otherCustomerOrderLine.ol_w_id.toString(), ', district ', otherCustomerOrderLine.ol_d_id.toString(), ' and id ', otherCustomerOrderLine.o_c_id.toString, '.')
                relatedCustomers.add(relatedCustomer)
              }
            } else {
              commonItemOrders.set(key, value)
            }
          }
        }

        for (const relCust of relatedCustomers) {
          console.log('>>>> %s', relCust)
        }
      } 
    } catch (err) {
        console.err(err.stack);
    }
}

module.exports = { relatedCustomerTransaction };