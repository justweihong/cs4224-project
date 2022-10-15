async function newOrderTransaction(client, W_ID, D_ID, C_ID, NUM_ITEMS, ITEM_NUMBER, SUPPLIER_WAREHOUSE, QUANTITY) {
    await client.query('BEGIN TRANSACTION').catch(err => {console.error(err.stack);})

    //STEP 1
    var N = 0;
    await client.query('SELECT D_NEXT_O_ID FROM Districts WHERE D_W_ID = ' + W_ID + ' AND D_ID = ' + D_ID).then(res => {
        N = res.rows[0].d_next_o_id;
    }).catch(err => {
        console.error(err.stack);
    });

    //STEP 2
    let nPlusOne = N + 1; 
    await client.query('UPDATE Districts SET D_NEXT_O_ID = ' + nPlusOne).catch(err => {
        console.error(err.stack);
    });

    //STEP 3
    var O_ALL_LOCAL = 1;
    for (var i = 0; i < SUPPLIER_WAREHOUSE.length; i++) {
        if (SUPPLIER_WAREHOUSE[i] != W_ID) {
            O_ALL_LOCAL = 0;
        }
    }
    var createNewOrderStmt = 'INSERT INTO Orders VALUES (' + W_ID + ',' + D_ID + ',' + N + ',' + C_ID + ', NULL,' + NUM_ITEMS + ',' + O_ALL_LOCAL + ', CURRENT_TIMESTAMP)';
    await client.query(createNewOrderStmt).catch(err => {
        console.error(err.stack);
    });

    //STEP 4
    var TOTAL_AMOUNT = 0.0;

    //STEP 5
    for (var i = 0; i < NUM_ITEMS; i++) {

        //PART A
        let ITEM_NO = ITEM_NUMBER[i];
        let WAREHOUSE = SUPPLIER_WAREHOUSE[i];
        var S_QUANTITY = 0;
        await client.query('SELECT S_QUANTITY FROM Stocks WHERE S_W_ID = ' + WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO).then(res => {
            S_QUANTITY = res.rows[0].s_quantity;
        }).catch(err => {
            console.error(err.stack);
        });

        //PART B
        var ADJUSTED_QTY = S_QUANTITY - QUANTITY[i];

        //PART C
        if (ADJUSTED_QTY < 10) {
            ADJUSTED_QTY = ADJUSTED_QTY + 100;
        }

        //PART D
        var updateStockStmt = "";
        if (SUPPLIER_WAREHOUSE[i] != W_ID) {
            updateStockStmt = 'UPDATE Stocks SET S_QUANTITY = ' + ADJUSTED_QTY + 
            ', S_YTD = S_YTD + ' + QUANTITY[i] + ', S_ORDER_CNT = S_ORDER_CNT + 1, S_REMOTE_CNT = S_REMOTE_CNT + 1 WHERE S_W_ID = ' + 
            WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO;
        } else {
            updateStockStmt = 'UPDATE Stocks SET S_QUANTITY = ' + ADJUSTED_QTY + 
            ', S_YTD = S_YTD + ' + QUANTITY[i] + ', S_ORDER_CNT = S_ORDER_CNT + 1 WHERE S_W_ID = ' + 
            WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO;
        }
        await client.query(updateStockStmt).catch(err => {
            console.error(err.stack);
        });

        //PART E
        var I_PRICE = 0;
        await client.query('SELECT I_PRICE FROM Items WHERE I_ID = ' + ITEM_NO).then(res => {
            I_PRICE = res.rows[0].i_price;
        }).catch(err => {
            console.error(err.stack);
        });
        var ITEM_AMOUNT = QUANTITY[i] * I_PRICE;

        //PART F
        TOTAL_AMOUNT = TOTAL_AMOUNT + ITEM_AMOUNT;

        //PART G
        var OL_DIST_INFO = '';
        var DISTRICT = '';
        if (D_ID === '10') {
            DISTRICT = D_ID;
        } else {
            DISTRICT = '0' + D_ID;
        }

        await client.query('SELECT S_DIST_'+ DISTRICT + ' FROM Stocks').then(res => {
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
        await client.query(createNewOrderLineStmt).catch(err => {
            console.error(err.stack);
        });
    }

    //STEP 6
    var W_TAX = 0;
    await client.query('SELECT W_TAX FROM Warehouses WHERE W_ID = ' + W_ID).then(res => {
        W_TAX = res.rows[0].w_tax;
    }).catch(err => {
        console.error(err.stack);
    });
    var D_TAX = 0;
    await client.query('SELECT D_TAX FROM Districts WHERE D_ID = ' + D_ID).then(res => {
        D_TAX = res.rows[0].d_tax;
    }).catch(err => {
        console.error(err.stack);
    });
    var C_DISCOUNT = 0;
    await client.query('SELECT C_DISCOUNT FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_DISCOUNT = res.rows[0].c_discount;
    }).catch(err => {
        console.error(err.stack);
    });
    D_TAX = parseFloat(D_TAX);
    W_TAX = parseFloat(W_TAX);
    TOTAL_AMOUNT = TOTAL_AMOUNT * (1 + D_TAX + W_TAX) * (1 - C_DISCOUNT);
    TOTAL_AMOUNT = TOTAL_AMOUNT.toFixed(2);

    await client.query('COMMIT').catch(err => {console.error(err.stack);})
    
    console.log('>>>> NEW ORDER TRANSACTION');

    //OUTPUT STEP 1
    var C_LAST = 0;
    await client.query('SELECT C_LAST FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_LAST = res.rows[0].c_last;
    }).catch(err => {
        console.error(err.stack);
    });
    var C_CREDIT = 0;
    await client.query('SELECT C_CREDIT FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_CREDIT = res.rows[0].c_credit;
    }).catch(err => {
        console.error(err.stack);
    });
    console.log('Customer Identifier(' + W_ID + ',' + D_ID + ',' + C_ID + '), LastName ' + C_LAST + ', Credit ' + C_CREDIT + ', Discount '  + C_DISCOUNT);

    //OUTPUT STEP 2
    console.log('Warehouse Tax Rate ' + W_TAX + ', District Tax Rate ' + D_TAX);

    //OUTPUT STEP 3
    var O_ENTRY_D;
    var getO_Entry_DQuery = 'SELECT o_entry_d FROM Orders WHERE O_W_ID = ' + W_ID + ' AND O_D_ID = ' + D_ID + ' AND O_ID = ' + N;
    console.log(getO_Entry_DQuery);
    await client.query(getO_Entry_DQuery).then(res => {
        O_ENTRY_D = res.rows[0].o_entry_d;
    }).catch(err => {
        console.error(err.stack);
    });
    console.log('Order Number ' + N + ', Entry Date ' + O_ENTRY_D);

    //OUTPUT STEP 4
    console.log('Number of Items ' + NUM_ITEMS + ', Total Amount for Order ' + TOTAL_AMOUNT);

    //OUTPUT STEP 5
    for (var i = 0; i < NUM_ITEMS; i++) {
        var ITEM_NO = ITEM_NUMBER[i];
        var I_NAME = 0;
        await client.query('SELECT I_NAME FROM Items WHERE I_ID = ' + ITEM_NO).then(res => {
            I_NAME = res.rows[0].i_name;
        }).catch(err => {
            console.error(err.stack);
        });
        var I_PRICE = 0;
        await client.query('SELECT I_PRICE FROM Items Where I_ID = ' + ITEM_NO).then(res => {
            I_PRICE = res.rows[0].i_price;
        }).catch(err => {
            console.error(err.stack);
        });
        var OL_AMOUNT = QUANTITY[i] * I_PRICE;
        var S_QUANTITY = 0;
        await client.query('SELECT S_QUANTITY FROM Stocks WHERE S_W_ID = ' + W_ID + ' AND S_I_ID = ' + ITEM_NO).then(res => {
            S_QUANTITY = res.rows[0].s_quantity;
        }).catch(err => {
            console.error(err.stack);
        });

        console.log(ITEM_NO + ', ' + I_NAME + ', ' + SUPPLIER_WAREHOUSE[i] + ', ' + QUANTITY[i] + ', ' + OL_AMOUNT + ', ' + S_QUANTITY);    
    }
    
}

module.exports = { newOrderTransaction };