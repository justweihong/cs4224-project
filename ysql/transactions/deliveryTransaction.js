async function deliveryTransaction(callbackHandler, client, w_id, carrier_id) {
  try {
      await client.query('BEGIN TRANSACTION');
      for (i = 0; i < 10; i++) {
          // PROCESS 1a
          var order_no = await client.query('SELECT MIN(o_id) FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + i + 1 + ' AND o_carrier_id = ' + null);
          var cust_no = await client.query('SELECT o_c_id FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + i + 1 + ' AND o_id = ' + order_no); 

          // PROCESS 1b
          await client.query('UPDATE orders SET o_carrier_id = ' + carrier_id + ' WHERE o_id = ' + order_no);

          // PROCESS 1c
          await client.query('UPDATE order_lines SET ol_delivery_d = CURRENT_TIMESTAMP WHERE ol_o_id = ' + order_no);

          // PROCESS 1d
          var balance = await client.query('SELECT SUM(ol_amounnt) FROM order_lines WHERE ol_o_id = ' + order_no);
          await client.query('UPDATE customers SET c_balance = c_balance + ' + balance + ', c_delivery_cnt = c_delivery_cnt + 1 WHERE c_id = ' + cust_no);
      }

      await client.query('COMMIT');

      callbackHandler();
  } catch (err) {
      callbackHandler(err);
  }
}

module.exports = { deliveryTransaction };