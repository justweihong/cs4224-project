const BigDecimal = require('cassandra-driver').types.BigDecimal;

async function deliveryTransaction(client, w_id, carrier_id) {
    if (carrier_id < 1 || carrier_id > 10) {
        console.error('Carrier ID does not fall betwwen the range of [1,10].');
    } else {
        await client
            .execute('START TRANSACTION')
            .catch(err => {
                console.error(err.stack);
            })

        for (let i = 0; i < 10; i++) {
            // PROCESS 1a
            var order_no;
            var cust_no;

            await client
                .execute('SELECT MIN(o_id) as min FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_carrier_id = null')
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
                .execute('UPDATE orders SET o_carrier_id = ' + carrier_id + ' WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + (i + 1) + ' AND o_id = ' + order_no)
                .catch(err => {
                    console.error(err.stack);
                })

            // PROCESS 1c
            var OL_NOS;
            await client
                .execute('SELECT ol_number from order_lines WHERE ol_w_id = ' + w_id + ' AND ol_d_id = ' + (i + 1) + ' AND ol_o_id = ' + order_no)
                .then(res => {
                    OL_NOS = res;
                })
                .catch(err => {
                    console.error(err.stack);
                })
            
            for (let j = 0; j < OL_NOS.length; j++) {
                await client
                .execute('UPDATE order_lines SET ol_delivery_d = toTimestamp(now()) WHERE ol_w_id = ' + w_id 
                    + ' AND ol_d_id = ' + (i + 1) + ' AND ol_o_id = ' + order_no + 'AND ol_number = ' + OL_NOS[j].ol_number)
                .catch(err => {
                    console.error(err.stack);
                })
            }

            // PROCESS 1d
            var SUM_DECIMAL;
            var NEW_C_BALANCE;
            var NEW_C_DELIVERY_CNT;
            await client
                .execute('SELECT SUM(ol_amount) as sum FROM order_lines WHERE ol_o_id = ' + order_no)
                .then(res => {
                    SUM_DECIMAL = BigDecimal.fromNumber(parseFloat(res.rows[0].sum));
                })
                .catch(err => {
                    console.error(err.stack);
                })

            await client
                .execute('SELECT c_balance, c_delivery_cnt from customers WHERE c_id = ' + cust_no)
                .then(res => {
                    NEW_C_BALANCE = res.rows[0].c_balance.add(SUM_DECIMAL);
                    NEW_C_DELIVERY_CNT = res.rows[0].c_delivery_cnt + 1;
                })
                .catch(err => {
                    console.error(err.stack);
                })

            await client
                .execute('UPDATE customers SET c_balance = ' + NEW_C_BALANCE + ', c_delivery_cnt = ' + NEW_C_DELIVERY_CNT 
                    + ' WHERE c_w_id = ' + w_id + ' AND c_d_id = ' + (i + 1) + 'AND c_id = ' + cust_no)
                .catch(err => {
                    console.error(err.stack);
                })
        }

        await client
            .execute('COMMIT')
            .then(() => {
                console.log('>>>> DELIVERY TRANSACTION SUCCESS');
            })
            .catch(err => {
                console.error(err.stack);
            })
    }
}

module.exports = { deliveryTransaction };