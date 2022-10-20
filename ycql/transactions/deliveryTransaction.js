async function deliveryTransaction(client, w_id, carrier_id) {
    if (carrier_id < 1 || carrier_id > 10) {
        console.error('Carrier ID does not fall betwwen the range of [1,10].');
    } else {
        for (i = 0; i < 10; i++) {
            // PROCESS 1a
            var order_no;
            var cust_no;

            await client
                .execute('SELECT MIN(o_id) FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_carrier_id IS NULL')
                .then(res => {
                    order_no = res.rows[0].min;
                })
                .catch(err => {
                    console.error(err.stack);
                })

            if (order_no == null) {
                if (i == 9 && !isUpdated) {
                    console.log('There is no yet-to-delivered orders in warehouse ' + w_id + '.');
                }
                continue;
            }

            var isUpdated = true;

            await client
                .execute('SELECT o_c_id FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_id = ' + order_no)
                .then(res => {
                    cust_no = res.rows[0].o_c_id;
                })
                .catch(err => {
                    console.error(err.stack);
                })

            // PROCESS 1b
            await client
                .execute('UPDATE orders SET o_carrier_id = ' + carrier_id + ' WHERE o_id = ' + order_no)
                .catch(err => {
                    console.error(err.stack);
                })

            // PROCESS 1c
            await client
                .execute('UPDATE order_lines SET ol_delivery_d = toTimestamp(now()) WHERE ol_o_id = ' + order_no)
                .catch(err => {
                    console.error(err.stack);
                })

            // PROCESS 1d
            var balance
            await client
                .execute('SELECT SUM(ol_amount) FROM order_lines WHERE ol_o_id = ' + order_no)
                .then(res => {
                    balance = res.rows[0].sum;
                })
                .catch(err => {
                    console.error(err.stack);
                })

            await client
                .execute('UPDATE customers SET c_balance = c_balance + ' + balance + ', c_delivery_cnt = c_delivery_cnt + 1 WHERE c_id = ' + cust_no)
                .catch(err => {
                    console.error(err.stack);
                })
        }

        console.log('>>>> DELIVERY TRANSACTION SUCCESS');
    }
}

module.exports = { deliveryTransaction };