module.exports = async function paymentTransaction(callbackHandler, c_w_id, c_d_id, c_id, payment) {
  try {
      await client.query('BEGIN TRANSACTION');
      // PROCESS 1
      await client.query('UPDATE warehouses SET w_ytd = w_ytd + ' + payment + ' WHERE w_id = ' + c_w_id);

      // PROCESS 2
      await client.query('UPDATE districts SET d_ytd = d_ytd + ' + payment + ' WHERE d_w_id = ' + c_w_id + ' AND d_id = ' + c_d_id);

      // PROCESS 3
      await client.query('UPDATE customers SET c_balance = c_balance - ' + payment 
          + ', c_ytd_payment = c_ytd_payment + ' + payment
          + ', c_payment_cnt = c_payment_cnt + 1 WHERE c_w_id = ' + c_w_id + ' AND c_d_id = ' + c_d_id + ' AND c_id = ' + c_id);

      await client.query('COMMIT');

      var row;
      // OUTPUT 1
      const customer_res = await client.query('SELECT * FROM customers WHERE c_w_id = ' + c_w_id + ' AND c_d_id = ' + c_d_id + ' AND c_id = ' + c_id);
      row = customer_res[0];
      console.log('Customer Identifier: (%d, %d, %d), Name: ($s, $s, $s)',
          c_w_id, c_d_id, c_id, row.c_first, row.c_middle, row.c_last);
      console.log('Address: (%s, %s, %s, %s, %s)',
          row.c_street_1, row.c_street_2, row.c_city, row.c_state, row.c_zip);
      console.log('Phone: $s, Since: %s, Credit: $s, Credit Limit: %f, Discount Rate: %f, Outstanding Payment: %f',
          row.c_phone, row.c_since, row.c_credit, row.c_credit_lim, row.c_discount, row.c_balance);
      
      // OUTPUT 2
      const warehouse_res = await client.query('SELECT * FROM warehouses WHERE w_id = ' + c_w_id);
      row = warehouse_res[0];
      console.log('Warehouse Address: (%s, %s, %s, %s, %s)',
          row.w_street_1, row.w_street_2, row.w_city, row.w_state, row.w_zip);
      
      // OUTPUT 3
      const district_res = await client.query('SELECT * FROM districts WHERE d_w_id = ' + c_w_id + ' AND d_id = ' + c_d_id);
      row = district_res[0];
      console.log('District Address: (%s, %s, %s, %s, %s)',
          row.d_street_1, row.d_street_2, row.d_city, row.d_state, row.d_zip);
      
      // OUTPUT 4
      console.log('Payment: %f', payment);

      callbackHandler();
  } catch (err) {
      callbackHandler(err);
  }
}