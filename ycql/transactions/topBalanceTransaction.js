const BigDecimal = require('cassandra-driver').types.BigDecimal;

function getTopTenCustomers(array1, array2) {
    var topTenCustomers = [];
    var counter = 0, i = 0, j = 0;

    if (typeof array1 == 'undefined' || array1.length == 0) {
        topTenCustomers = array2;
    } else if (typeof array2 == 'undefined' || array2.length == 0) {
        topTenCustomers = array1;
    } else {
        while (counter < 10 && i < array1.length && j < array2.length) {
            if (array2[j].c_balance.compare(array1[i].c_balance) == 1) {
                topTenCustomers[counter] = array2[j];
                j++;
            } else {
                topTenCustomers[counter] = array1[i];
                i++;
            }
            counter++;
        }
           
        while (counter < 10 && i < array1.length) {
            topTenCustomers[counter] = array1[i];
            i++;
            counter++;
        }

        while (counter < 10 && j < array2.length) {
            topTenCustomers[counter] = array2[j];
            j++;
            counter++;
        }
    }

    return topTenCustomers;
}

async function topBalanceTransaction(client) {
    var getCustomers = 'SELECT w_id FROM Warehouses';
    var warehouseList = []
    await client.execute(getCustomers).then(res => {
        warehouseList = res.rows;
    }).catch(err => {
        console.error(err.stack);
    });

    var customerList = [];
    var currWarehouse;

    for (let i = 0; i < warehouseList.length; i++) {
        currWarehouse = warehouseList[i].w_id;
        var getCustomers = 'SELECT C_W_ID, C_D_ID, C_FIRST, C_MIDDLE, C_LAST, C_BALANCE FROM Customers WHERE C_W_ID = ' + currWarehouse + ' LIMIT 10';
        await client.execute(getCustomers).then(res => {
            customerList[i] = res.rows;
        }).catch(err => {
            console.error(err.stack);
        });
    }

    while (customerList.length > 1) {
        const mergedCustList = [];

        for (let i = 0; i < customerList.length; i += 2) {
            var arr1 = customerList[i];
            var arr2 = customerList[i + 1];

            mergedCustList.push(getTopTenCustomers(arr1, arr2));
        }

        customerList = mergedCustList;
    }
    
    for (let i = 0; i < 10; i++) {
        var currentCustomer = customerList[0][i];
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

module.exports = { topBalanceTransaction };