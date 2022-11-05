async function topBalanceTransaction(client) {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED')
    try { 
        var getTopBalanceStatement = 'SELECT * FROM Customers ORDER BY C_BALANCE DESC LIMIT 10';
        var customerList = []
        await client.query(getTopBalanceStatement).then(res => {
            customerList = res.rows;
        })
        
        for (var i = 0; i < customerList.length; i++) {
            var currentCustomer = customerList[i];
            console.log('Customer Name : (' + currentCustomer.c_first + ', ' + currentCustomer.c_middle + ', ' + currentCustomer.c_last + ')');
            console.log('Outstanding Balance : ' + currentCustomer.c_balance);

            var getWarehouseNameStatement = 'SELECT * FROM Warehouses WHERE W_ID = ' + currentCustomer.c_w_id;
            var warehouseName;
            await client.query(getWarehouseNameStatement).then(res => {
                warehouseName = res.rows[0].w_name;
            })
            console.log('Warehouse Name : ' + warehouseName);

            var getDistrictNameStatement = 'SELECT * FROM Districts WHERE D_ID = ' + currentCustomer.c_d_id + ' AND D_W_ID = ' + currentCustomer.c_w_id;
            var districtName;
            await client.query(getDistrictNameStatement).then(res => {
                districtName = res.rows[0].d_name;
            })
            console.log('District Name : ' + districtName);
        }
        await client.query('COMMIT TRANSACTION')
    } catch(err) {
        await client.query('ABORT TRANSACTION')
    } 
}

module.exports = { topBalanceTransaction };