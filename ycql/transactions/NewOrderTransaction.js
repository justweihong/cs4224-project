const BigDecimal = require('cassandra-driver').types.BigDecimal;

async function newOrderTransaction(callbackHadler, client, W_ID, D_ID, C_ID, NUM_ITEMS, ITEM_NUMBER, SUPPLIER_WAREHOUSE, QUANTITY) {
    await client
        .execute('START TRANSACTION')
        .catch(err => {
            console.error(err.stack);
        })

    var N = 0;
    await client.execute('SELECT D_NEXT_O_ID FROM Districts WHERE D_W_ID = ' + W_ID + ' AND D_ID = ' + D_ID).then(res => {
        N = res.rows[0].d_next_o_id;
    }).catch(err => {
        console.error(err.stack);
    });

    let nPlusOne = N + 1; 
    await client.execute('UPDATE Districts SET D_NEXT_O_ID = ' + nPlusOne + ' WHERE D_W_ID = ' + W_ID + ' AND D_ID = ' + D_ID).catch(err => {
        console.error(err.stack);
    });

    var O_ALL_LOCAL = 1;
    for (var i = 0; i < SUPPLIER_WAREHOUSE.length; i++) {
        if (SUPPLIER_WAREHOUSE[i] != W_ID) {
            O_ALL_LOCAL = 0;
        }
    }
    var createNewOrderStmt = 'INSERT INTO Orders (O_W_ID, O_D_ID, O_ID, O_C_ID, O_CARRIER_ID, O_OL_CNT, O_ALL_LOCAL, O_ENTRY_D)' 
        + ' VALUES (' + W_ID + ',' + D_ID + ',' + N + ',' + C_ID + ', NULL,' + NUM_ITEMS + ',' + O_ALL_LOCAL + ', toTimestamp(now()))';
    await client.execute(createNewOrderStmt).catch(err => {
        console.error(err.stack);
    });

    var TOTAL_AMOUNT = 0.0;

    for (var i = 0; i < NUM_ITEMS; i++) {

        let ITEM_NO = ITEM_NUMBER[i];
        let WAREHOUSE = SUPPLIER_WAREHOUSE[i];
        var S_QUANTITY = 0;
        var QUANTITY_DECIMAL = BigDecimal.fromNumber(parseFloat(QUANTITY[i]));
        var NEW_S_YTD;
        await client.execute('SELECT S_QUANTITY, S_YTD FROM Stocks WHERE S_W_ID = ' + WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO).then(res => {
            S_QUANTITY = res.rows[0].s_quantity;
            NEW_S_YTD = res.rows[0].s_ytd.add(QUANTITY_DECIMAL);
        }).catch(err => {
            console.error(err.stack);
        });

        var ADJUSTED_QTY = S_QUANTITY - QUANTITY[i];

        if (ADJUSTED_QTY < 10) {
            ADJUSTED_QTY = ADJUSTED_QTY + 100;
        }


        var updateStockStmt = "";
        if (SUPPLIER_WAREHOUSE[i] != W_ID) {
            updateStockStmt = 'UPDATE Stocks SET S_QUANTITY = ' + ADJUSTED_QTY + 
            ', S_YTD = ' + NEW_S_YTD + ', S_ORDER_CNT = S_ORDER_CNT + 1, S_REMOTE_CNT = S_REMOTE_CNT + 1 WHERE S_W_ID = ' + 
            WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO;
        } else {
            updateStockStmt = 'UPDATE Stocks SET S_QUANTITY = ' + ADJUSTED_QTY + 
            ', S_YTD = ' + NEW_S_YTD + ', S_ORDER_CNT = S_ORDER_CNT + 1 WHERE S_W_ID = ' + 
            WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO;
        }
        await client.execute(updateStockStmt).catch(err => {
            console.error(err.stack);
        });

        var I_PRICE = 0;
        await client.execute('SELECT I_PRICE FROM Items WHERE I_ID = ' + ITEM_NO).then(res => {
            I_PRICE = res.rows[0].i_price;
        }).catch(err => {
            console.error(err.stack);
        });
        var ITEM_AMOUNT = QUANTITY[i] * I_PRICE;

        TOTAL_AMOUNT = TOTAL_AMOUNT + ITEM_AMOUNT;

        var OL_DIST_INFO = '';
        var DISTRICT = '';
        if (D_ID === '10') {
            DISTRICT = D_ID;
        } else {
            DISTRICT = '0' + D_ID;
        }

        await client.execute('SELECT S_DIST_'+ DISTRICT + ' FROM Stocks').then(res => {
            switch(D_ID) {
                case '1':
                    OL_DIST_INFO = res.rows[0].s_dist_01;
                    break;
                case '2':
                    OL_DIST_INFO = res.rows[0].s_dist_02;
                    break;
                case '3':
                    OL_DIST_INFO = res.rows[0].s_dist_03;
                    break;
                case '4':
                    OL_DIST_INFO = res.rows[0].s_dist_04;
                    break;
                case '5':
                    OL_DIST_INFO = res.rows[0].s_dist_05;
                    break;
                case '6':
                    OL_DIST_INFO = res.rows[0].s_dist_06;
                    break;
                case '7':
                    OL_DIST_INFO = res.rows[0].s_dist_07;
                    break;
                case '8':
                    OL_DIST_INFO = res.rows[0].s_dist_08;
                    break;
                case '9':
                    OL_DIST_INFO = res.rows[0].s_dist_09;
                    break;
                case '10':
                    OL_DIST_INFO = res.rows[0].s_dist_10;
                    break;
            }
        }).catch(err => {
            console.error(err.stack);
        });
        var createNewOrderLineStmt = 'INSERT INTO Order_Lines (OL_W_ID, OL_D_ID, OL_O_ID, OL_NUMBER, OL_I_ID, OL_DELIVERY_D, OL_AMOUNT, OL_SUPPLY_W_ID, OL_QUANTITY, OL_DIST_INFO)' +  
            ' VALUES (' + W_ID + ', ' + D_ID +', '+ N +', ' + (i + 1) + ', ' + ITEM_NO + ', NULL, ' + ITEM_AMOUNT + ', ' + WAREHOUSE + ', ' + QUANTITY[i] + ', \'' + OL_DIST_INFO + '\')';
        await client.execute(createNewOrderLineStmt).catch(err => {
            console.error(err.stack);
        });
    }

    var W_TAX = 0;
    await client.execute('SELECT W_TAX FROM Warehouses WHERE W_ID = ' + W_ID).then(res => {
        W_TAX = res.rows[0].w_tax;
    }).catch(err => {
        console.error(err.stack);
    });
    var D_TAX = 0;
    await client.execute('SELECT D_TAX FROM Districts WHERE D_ID = ' + D_ID).then(res => {
        D_TAX = res.rows[0].d_tax;
    }).catch(err => {
        console.error(err.stack);
    });
    var C_DISCOUNT = 0;
    await client.execute('SELECT C_DISCOUNT FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_DISCOUNT = res.rows[0].c_discount;
    }).catch(err => {
        console.error(err.stack);
    });
    D_TAX = parseFloat(D_TAX);
    W_TAX = parseFloat(W_TAX);
    TOTAL_AMOUNT = TOTAL_AMOUNT * (1 + D_TAX + W_TAX) * (1 - C_DISCOUNT);
    TOTAL_AMOUNT = TOTAL_AMOUNT.toFixed(2);
    
    await client
        .execute('COMMIT')
        .catch(err => {
            console.error(err.stack);
        })
    
    console.log('>>>> NEW ORDER TRANSACTION');

    var C_LAST = 0;
    await client.execute('SELECT C_LAST FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_LAST = res.rows[0].c_last;
    }).catch(err => {
        console.error(err.stack);
    });
    var C_CREDIT = 0;
    await client.execute('SELECT C_CREDIT FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_CREDIT = res.rows[0].c_credit;
    }).catch(err => {
        console.error(err.stack);
    });
    console.log('Customer Identifier(' + W_ID + ',' + D_ID + ',' + C_ID + '), LastName ' + C_LAST + ', Credit ' + C_CREDIT + ', Discount '  + C_DISCOUNT);

    console.log('Warehouse Tax Rate ' + W_TAX + ', District Tax Rate ' + D_TAX);

    var O_ENTRY_D;
    var getO_Entry_DQuery = 'SELECT o_entry_d FROM Orders WHERE O_W_ID = ' + W_ID + ' AND O_D_ID = ' + D_ID + ' AND O_ID = ' + N;
    console.log(getO_Entry_DQuery);
    await client.execute(getO_Entry_DQuery).then(res => {
        O_ENTRY_D = res.rows[0].o_entry_d;
    }).catch(err => {
        console.error(err.stack);
    });
    console.log('Order Number ' + N + ', Entry Date ' + O_ENTRY_D);

    console.log('Number of Items ' + NUM_ITEMS + ', Total Amount for Order ' + TOTAL_AMOUNT);

    for (var i = 0; i < NUM_ITEMS; i++) {
        var ITEM_NO = ITEM_NUMBER[i];
        var I_NAME = 0;
        await client.execute('SELECT I_NAME FROM Items WHERE I_ID = ' + ITEM_NO).then(res => {
            I_NAME = res.rows[0].i_name;
        }).catch(err => {
            console.error(err.stack);
        });
        var I_PRICE = 0;
        await client.execute('SELECT I_PRICE FROM Items Where I_ID = ' + ITEM_NO).then(res => {
            I_PRICE = res.rows[0].i_price;
        }).catch(err => {
            console.error(err.stack);
        });
        var OL_AMOUNT = QUANTITY[i] * I_PRICE;
        var S_QUANTITY = 0;
        await client.execute('SELECT S_QUANTITY FROM Stocks WHERE S_W_ID = ' + W_ID + ' AND S_I_ID = ' + ITEM_NO).then(res => {
            S_QUANTITY = res.rows[0].s_quantity;
        }).catch(err => {
            console.error(err.stack);
        });

        console.log(ITEM_NO + ', ' + I_NAME + ', ' + SUPPLIER_WAREHOUSE[i] + ', ' + QUANTITY[i] + ', ' + OL_AMOUNT + ', ' + S_QUANTITY);    
    }
}

module.exports = { newOrderTransaction };