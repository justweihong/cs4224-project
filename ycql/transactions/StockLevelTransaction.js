async function stockLevelTransaction(client, W_ID, D_ID, T, L) {
    const orderQuery = 'SELECT O_ID FROM orders' + 
        ' WHERE O_W_ID = ' + W_ID + ' AND O_D_ID = ' + D_ID +
        ' ORDER BY O_ID DESC LIMIT ' + L + ';';
    const lastOrders = (await client.execute(orderQuery)).rows; 
    const lastOrderIds = '(' + lastOrders.map((x) => x.o_id).toString() + ')' // Order IDs to parse in CQL IN query

    const itemQuery = 'SELECT OL_I_ID FROM order_lines' + 
        ' WHERE OL_W_ID = ' + W_ID + ' AND OL_D_ID = ' + D_ID +
        ' AND OL_O_ID IN ' + lastOrderIds;
    const items = (await client.execute(itemQuery)).rows;
    const uniqueItems = [...new Set(items)];
    const itemIds = '(' + uniqueItems.map((x) => x.ol_i_id).toString() + ')' // Order IDs to parse in CQL IN query

    const stockQuery = 'SELECT COUNT(S_I_ID) as count FROM stocks' + 
        ' WHERE S_W_ID = ' + W_ID + ' AND S_I_ID IN ' + itemIds + ' AND S_QUANTITY < ' + T;
    const noOfItemsWithLowStock = (await client.execute(stockQuery)).rows[0].count;
    console.log('Total number of items with low stock: %d', noOfItemsWithLowStock);
}

module.exports = { stockLevelTransaction };