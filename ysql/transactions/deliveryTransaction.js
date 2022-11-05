async function deliveryTransaction(client, w_id, carrier_id) {
    var isUpdated = false;
	await client.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE')
    try {
        for (let i = 0; i < 10; i++) {
            // PROCESS 1a
            var order_no;
            var cust_no;
            await client
                .query('SELECT MIN(o_id) FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_carrier_id IS NULL')
                .then(res => {
                    order_no = res.rows[0].min;
                })
                
            if (order_no == null) {
                if (i == 9 && !isUpdated) {
                    console.log('There is no yet-to-delivered orders in warehouse ' + w_id + '.');
                }
                continue;

            }

            var isUpdated = true;
            await client
                .query('SELECT o_c_id FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_id = ' + order_no)
                .then(res => {
                    cust_no = res.rows[0].o_c_id;
                })

            // PROCESS 1b
            await client
                .query('UPDATE orders SET o_carrier_id = ' + carrier_id + ' WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_id = ' + order_no)

            await client
                .query('UPDATE order_lines SET ol_delivery_d = CURRENT_TIMESTAMP WHERE ol_o_id = ' + order_no)

            // PROCESS 1d
            var balance
            await client
                .query('SELECT SUM(ol_amount) FROM order_lines WHERE ol_o_id = ' + order_no)
                .then(res => {
                        balance = res.rows[0].sum;
                    })
                
                await client
                    .query('UPDATE customers SET c_balance = c_balance + ' + balance + ', c_delivery_cnt = c_delivery_cnt + 1 WHERE c_w_id = ' + w_id + ' AND c_d_id = ' + (i + 1) + 'AND c_id = ' + cust_no)
            }

            await client.query('COMMIT TRANSACTION')
                //.then(() => { console.log('>>>> DELIVERY TRANSACTION SUCCESS'); })
    } catch(err) {
        await client.query('ABORT TRANSACTION')
    }      
}

module.exports = { deliveryTransaction };