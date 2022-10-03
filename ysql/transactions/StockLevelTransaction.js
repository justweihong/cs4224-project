async function StockLevelTransaction(client, W_ID, D_ID, T, L) {
    // Get last L order IDs
    const orderQuery = 'SELECT O_ID FROm Order' + 
        ' WHERE O_W_ID = ' + W_ID + ' AND O_D_ID = ' + D_ID +
        ' ORDER BY O_ENTRY_D DESC LIMIT ' + L;
    const lastLOrders = await client(orderQuery); // TODO: format such that it is sql list

    // Get distinct items from order line
    const itemQuery = 'SELECT DISTINCT OL_I_ID FROM OrderLine' + 
        ' WHERE ORDER IN ' + lastOrders;
    const items = await client(itemQuery);

    // Get items below threshold from stocks
    const stockQuery = 'SELECT COUNT(S_I_ID) FROM Stock' + 
        ' WHERE S_W_ID = ' + W_ID + ' AND S_I_ID IN ' + items + ' AND S_QUANTITY > ' + T;
    const noOfItemsWithLowStock = await client(stockQuery);
    console.log(noOfItemsWithLowStock);
}