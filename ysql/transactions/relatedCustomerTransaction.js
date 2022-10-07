async function relatedCustomerTransaction(client, given_w_id, given_d_id, given_c_id) {
    try { 
      console.log('>>>> Given customer has warehouse %s, district %s and id %s.', given_w_id, given_d_id, given_c_id)
      console.log('>>>> Identifying customers related to given customer.');
      var stmt = `WITH givenCustomerOrders AS 
      (SELECT orders.o_w_id, orders.o_d_id, orders.o_id 
	  FROM orders 
	  WHERE orders.o_c_id = ${given_c_id} AND orders.o_d_id = ${given_d_id} AND orders.o_w_id = ${given_w_id})
	  
      SELECT order_lines.ol_w_id, order_lines.ol_d_id, order_lines.ol_o_id, order_lines.ol_i_id
      FROM order_lines, givenCustomerOrders
      WHERE 
      order_lines.ol_w_id = givenCustomerOrders.o_w_id AND
      order_lines.ol_d_id = givenCustomerOrders.o_d_id AND
      order_lines.ol_o_id = givenCustomerOrders.o_id`;

      const givenCustomerOrderLines = await client.query(stmt);
      console.log('>>>> Order lines for given customer procured.')

      stmt = `WITH otherCustomerOrders AS 
      (SELECT orders.o_w_id, orders.o_d_id, orders.o_id, orders.o_c_id
      FROM orders
      WHERE orders.o_c_id != ${given_c_id} AND orders.o_w_id != ${given_w_id})
      
      SELECT order_lines.ol_w_id, order_lines.ol_d_id, order_lines.ol_o_id, order_lines.ol_i_id, orders.o_c_id 
      FROM 
	  ((order_lines
      JOIN orders
      ON (order_lines.ol_w_id = orders.o_w_id AND order_lines.ol_d_id = orders.o_d_id AND order_lines.ol_o_id = orders.o_id)) 
	  JOIN otherCustomerOrders
      ON (order_lines.ol_w_id = otherCustomerOrders.o_w_id AND order_lines.ol_d_id = otherCustomerOrders.o_d_id AND order_lines.ol_o_id = otherCustomerOrders.o_id))`;

      const otherCustomerOrderLines = await client.query(stmt);
      console.log('>>>> Order lines for customers with foreign warehouses procured.')

      var commonItemOrders = new Map();
      var relatedCustomers = new Set();

      for (i = 0; i < otherCustomerOrderLines.rows.length; i++) {
        var otherCustomerOrderLine = otherCustomerOrderLines.rows[i];

        for (j = 0; j < givenCustomerOrderLines.rows.length; j++) {
          var givenCustomerOrderLine = givenCustomerOrderLines.rows[j];

          if(otherCustomerOrderLine.ol_i_id == givenCustomerOrderLine.ol_i_id) {
            var key = otherCustomerOrderLine.o_c_id.toString().concat("_", otherCustomerOrderLine.ol_o_id);
            var value = otherCustomerOrderLine.ol_i_id;
            if(commonItemOrders.has(key)) {
              if(commonItemOrders.get(key) != value) {
                var relatedCustomer = ''.concat('Related customer has warehouse ', otherCustomerOrderLine.ol_w_id.toString(), ', district ', otherCustomerOrderLine.ol_d_id.toString(), ' and id ', otherCustomerOrderLine.o_c_id.toString(), '.')
                relatedCustomers.add(relatedCustomer);
              }
            } else {
              commonItemOrders.set(key, value);
            }
          }
        }
        }
		
		console.log('>>>> Printing Related Customers');
		for (const relCust of relatedCustomers) {
        console.log('>>>> %s', relCust);	
     
    } catch (err) {
        console.error(err.stack);
    }
}

module.exports = { relatedCustomerTransaction };