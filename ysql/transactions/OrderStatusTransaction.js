async function orderStatusTransaction(client, C_W_ID, C_D_ID, C_ID) {
    // Get customer information
    const customerQuery = 'SELECT C_FIRST, C_MIDDLE, C_LAST, C_BALANCE FROM customers' + 
        ' WHERE C_W_ID = ' + C_W_ID + ' AND C_D_ID = ' + C_D_ID + ' AND C_ID = ' + C_ID;
    const customer =(await client.query(customerQuery)).rows[0];
    console.log("Customer's Name (%s, %s, %s), balance %d",
        customer.c_first, customer.c_middle, customer.c_last, customer.c_balance) 

    // Get Customer Last Order
    const orderQuery = 'SELECT O_ID, O_ENTRY_D, O_CARRIER_ID FROM orders' + 
        ' WHERE O_W_ID = ' + C_W_ID + ' AND O_D_ID = ' + C_D_ID + ' AND O_C_ID = ' + C_ID + 
        ' ORDER BY O_ENTRY_D DESC LIMIT 1';
    const lastOrder = (await client.query(orderQuery)).rows[0];
    console.log('Customer\'s last order number: %d, entry date and time: %o, carrier identifier: %d',
        lastOrder.o_id, lastOrder.o_entry_d, lastOrder.o_carrier_id) 

    // Get Order Items
    const orderLineQuery = 'SELECT OL_I_ID, OL_SUPPLY_W_ID, OL_QUANTITY, OL_AMOUNT, OL_DELIVERY_D FROM order_lines' + 
        ' WHERE OL_W_ID = ' + C_W_ID + ' AND OL_D_ID = ' + C_D_ID + ' AND OL_O_ID = ' + lastOrder.o_id;
    const orderLines = (await client.query(orderLineQuery)).rows;
    console.log('Items:')
    orderLines.forEach(orderLine => {
        console.log('\t Item no: %d, supply warehouse no: %d, quantity ordered: %d, total price: %d, delivery date and time: %o',
            orderLine.ol_i_id, orderLine.ol_supply_w_id, orderLine.ol_quantity, orderLine.ol_amount, orderLine.ol_delivery_d)
    })
};

module.exports = { orderStatusTransaction };