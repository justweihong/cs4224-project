async function stockLevelTransaction(client, W_ID, D_ID, T, L) {
    // Get last L order IDs from the stated warehouse and district
    const orderQuery = 'SELECT O_ID FROM orders' + 
        ' WHERE O_W_ID = ' + W_ID + ' AND O_D_ID = ' + D_ID +
        ' ORDER BY O_ENTRY_D DESC LIMIT ' + L + ';';
    const lastOrders = (await client.query(orderQuery)).rows; 
    const lastOrderIds = '(' + lastOrders.map((x) => x.o_id).toString() + ')' // Order IDs to parse in SQL IN query

    // Get distinct items from order line
    const itemQuery = 'SELECT DISTINCT OL_I_ID FROM order_lines' + 
        ' WHERE OL_W_ID = ' + W_ID + ' AND OL_D_ID = ' + D_ID +
        ' AND OL_O_ID IN ' + lastOrderIds;
    const items = (await client.query(itemQuery)).rows;
    const itemIds = '(' + items.map((x) => x.ol_i_id).toString() + ')' // Order IDs to parse in SQL IN query

    // Get items below threshold from stocks
    const stockQuery = 'SELECT COUNT(S_I_ID) FROM stocks' + 
        ' WHERE S_W_ID = ' + W_ID + ' AND S_I_ID IN ' + itemIds + ' AND S_QUANTITY < ' + T;
    const noOfItemsWithLowStock = (await client.query(stockQuery)).rows[0].count;
    console.log('Total number of items with low stock: %d', noOfItemsWithLowStock);
}

module.exports = { stockLevelTransaction };