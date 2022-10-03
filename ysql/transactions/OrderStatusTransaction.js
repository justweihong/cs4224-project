async function OrderStatusTransaction(client, C_W_ID, C_D_ID, C_ID) {

    // Get customer information
    const customerQuery = 'SELECT C_FIRST, C_MIDDLE, C_LAST, C_BALANCE FROM Customer' + 
        ' WHERE C_W_ID = ' + C_W_ID + ' AND C_D_ID = ' + C_D_ID + ' AND C_ID = ' + C_ID;
    const customerDetails = await client(customerQuery);
    console.log('customerDetails') // TODO: change to  (C FIRST, C MIDDLE, C LAST), balance C BALANCE

    // Get Customer Last Order
    const orderQuery = 'SELECT O_ID, O_ENTRY_D, O_CARRIER_ID FROM Order' + 
        ' WHERE O_W_ID = ' + C_W_ID + ' AND O_D_ID = ' + C_D_ID + ' AND O_C_ID = ' + C_ID + 
        ' ORDER BY O_ENTRY_D DESC LIMIT 1';
    const orderDetails = await client(orderQuery);
    const O_ID = orderDetails.O_ID // Update to get that value property
    console.log('customer last order') // TODO: change to  O_ID, O_ENTRY_D, O_CARRIER_ID

    // Get Order Items
    const orderLineQuery = 'SELECT OL_I_ID, OL_SUPPLY_W_ID, OL_QUANTITY, OL_AMOUNT, OL_DELIVERY_D FROM OrderLine' + 
        ' WHERE OL_W_ID = ' + C_W_ID + ' AND OL_D_ID = ' + C_D_ID + ' AND OL_O_ID = ' + O_ID;
    const orderLineDetails = await client(orderLineQuery);
    console.log('order line details') // TODO: for each OL_I_ID, OL_SUPPLY_W_ID, OL_QUANTITY, OL_AMOUNT, OL_DELIVERY_D

}