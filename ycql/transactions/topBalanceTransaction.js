async function getTopBalance(client) {
    var getTopBalanceStatement = 'SELECT * FROM Customers ORDER BY C_BALANCE DESC LIMIT 10';
    var customerList = []
    await client.execute(getTopBalanceStatement).then(res => {
        customerList = res.rows;
    }).catch(err => {
        console.error(err.stack);
    });
    
    for (var i = 0; i < customerList.length; i++) {
        var currentCustomer = customerList[i];
        console.log('Customer Name : (' + currentCustomer.c_first + ', ' + currentCustomer.c_middle + ', ' + currentCustomer.c_last + ')');
        console.log('Outstanding Balance : ' + currentCustomer.c_balance);

        var getWarehouseNameStatement = 'SELECT * FROM Warehouses WHERE W_ID = ' + currentCustomer.c_w_id;
        var warehouseName;
        await client.execute(getWarehouseNameStatement).then(res => {
            warehouseName = res.rows[0].w_name;
        }).catch(err => {
            console.error(err.stack);
        });
        console.log('Warehouse Name : ' + warehouseName);

        var getDistrictNameStatement = 'SELECT * FROM Districts WHERE D_ID = ' + currentCustomer.c_d_id + ' AND D_W_ID = ' + currentCustomer.c_w_id;
        var districtName;
        await client.execute(getDistrictNameStatement).then(res => {
            districtName = res.rows[0].d_name;
        }).catch(err => {
            console.error(err.stack);
        });
        console.log('District Name : ' + districtName);
    }
}

module.exports = { getTopBalance };