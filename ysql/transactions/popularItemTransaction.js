async function popularItemTransaction(client, w_id, d_id, l) {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED')
    try {
        console.log('District Identifier (' + w_id + ', ' + d_id + ')');
        console.log('Last Order to be examined : ' + l);

        var N = 0;
        await client.query('SELECT D_NEXT_O_ID FROM Districts WHERE D_W_ID = ' + w_id + ' AND D_ID = ' + d_id).then(res => {
            N = res.rows[0].d_next_o_id;
        })

        var selectLastOrderStatement = 'SELECT * FROM Orders WHERE O_W_ID = ' + w_id + ' AND O_D_ID = ' + d_id + 'ORDER BY O_ID DESC LIMIT ' + l;
        var S;

        await client.query(selectLastOrderStatement).then(res => {
            S = res.rows;
        })

        var popularItemsNames = [];
        var orderLinesList = [];
        var popularItemsList = [];
        for (var i = 0; i < l; i++) {
            var order = S[i];
            console.log('Order Number : ' + order.o_id + ' Entry Date and Time : ' + order.o_entry_d);

            var getCustomerNameStatement = 'SELECT * FROM Customers WHERE C_W_ID = ' + w_id + ' AND C_D_ID = ' + d_id + ' AND C_ID = ' + order.o_c_id;
            var customer;
            await client.query(getCustomerNameStatement).then(res => {
                customer = res.rows[0];
            })
            console.log('Customer (' + customer.c_first + ', ' + customer.c_middle + ', ' + customer.c_last + ')');

            var getOrderlinesStatement = 'SELECT * FROM Order_Lines WHERE OL_W_ID = ' + w_id + ' AND OL_D_ID = ' + d_id + ' AND OL_O_ID = ' + order.o_id;
            var orderLines;
            await client.query(getOrderlinesStatement).then(res => {
                orderLines = res.rows;
                orderLinesList.push(orderLines);
            })

            var popularItems = [];
            for (var y = 0; y < orderLines.length - 1; y++) {
                var orderItem = orderLines[y];

                for (var x = y + 1; x < orderLines.length; x++) {
                    var nextOrderItem = orderLines[x];
                    if (orderItem.ol_quantity < nextOrderItem.ol_quantity) {
                        if (popularItems.includes(nextOrderItem.ol_i_id)) {

                        } else {
                            popularItems.push(nextOrderItem.ol_i_id);

                            var getItemNameStatement = 'SELECT * FROM Items WHERE I_ID = ' + nextOrderItem.ol_i_id;
                            var itemName;
                            await client.query(getItemNameStatement).then(res => {
                                itemName = res.rows[0].i_name;
                                console.log('Item name : ' + itemName + ' Quantity Ordered : ' + nextOrderItem.ol_quantity);
                            })

                            if (popularItemsList.includes(nextOrderItem.ol_i_id)) {

                            } else {
                                popularItemsList.push(nextOrderItem.ol_i_id);
                                popularItemsNames.push(itemName);
                            }
                        }
                    } else if (orderItem.ol_quantity > nextOrderItem.ol_quantity) {
                        if (popularItems.includes(orderItem.ol_i_id)) {

                        } else {
                            popularItems.push(orderItem.ol_i_id);
                            var getItemNameStatement = 'SELECT * FROM Items WHERE I_ID = ' + orderItem.ol_i_id;
                            var itemName;
                            await client.query(getItemNameStatement).then(res => {
                                itemName = res.rows[0].i_name;
                                console.log('Item name : ' + itemName + ' Quantity Ordered : ' + nextOrderItem.ol_quantity);
                            })

                            if (popularItemsList.includes(orderItem.ol_i_id)) {

                            } else {
                                popularItemsList.push(orderItem.ol_i_id);
                                popularItemsNames.push(itemName);
                            }
                        }
                    } else {

                    }
                }
            }
        }

        for (var i = 0; i < popularItemsList.length; i++) {
            var countOfOrdersThatContainThisItem = 0;
            for (var y = 0; y < orderLinesList.length; y++) {
                var currentOrder = orderLinesList[y];
                for (var x = 0; x < currentOrder.length; x++) {
                    if (parseInt(currentOrder[x].ol_i_id) == parseInt(popularItemsList[i])) {
                        countOfOrdersThatContainThisItem++;
                    }
                }
            }

            var percent = countOfOrdersThatContainThisItem / l * 100;
            console.log('Item Name: ' + popularItemsNames[i] + ' Percentage : ' + percent + '%');
        }
        await client.query('COMMIT TRANSACTION')
    } catch(err) {
        await client.query('ABORT TRANSACTION')
    } 
}

module.exports = { popularItemTransaction };