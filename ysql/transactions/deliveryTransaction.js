async function deliveryTransaction(client, w_id, carrier_id) {
    var isUpdated = false;

    await client
        .query('BEGIN TRANSACTION')
        .catch(err => {
            console.error(err.stack);
        })

    for (i = 0; i < 10; i++) {
        // PROCESS 1a
        var order_no;
        var cust_no;
        await client
            .query('SELECT MIN(o_id) FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_carrier_id IS NULL')
            .then(res => {
                order_no = res.rows[0].min;
                // console.log(order_no);
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
            .query('SELECT o_c_id FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_id = ' + order_no)
            .then(res => {
                cust_no = res.rows[0].o_c_id;
            })
            .catch(err => {
                console.error(err.stack);
            })

        // PROCESS 1b
        await client
            .query('UPDATE orders SET o_carrier_id = ' + carrier_id + ' WHERE o_id = ' + order_no)
            .catch(err => {
                console.error(err.stack);
            })

        // PROCESS 1c
        await client
            .query('UPDATE order_lines SET ol_delivery_d = CURRENT_TIMESTAMP WHERE ol_o_id = ' + order_no)
            .catch(err => {
                console.error(err.stack);
            })

        // PROCESS 1d
        var balance
        await client
            .query('SELECT SUM(ol_amount) FROM order_lines WHERE ol_o_id = ' + order_no)
            .then(res => {
                balance = res.rows[0].sum;
            })
            .catch(err => {
                console.error(err.stack);
            })

        await client
            .query('UPDATE customers SET c_balance = c_balance + ' + balance + ', c_delivery_cnt = c_delivery_cnt + 1 WHERE c_id = ' + cust_no)
            .catch(err => {
                console.error(err.stack);
            })
    }

    await client
        .query('COMMIT')
        //.then(() => { console.log('>>>> DELIVERY TRANSACTION SUCCESS'); })
        .catch(err => {
            console.error(err.stack);
        })

}

module.exports = { deliveryTransaction };