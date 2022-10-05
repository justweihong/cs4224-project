async function newOrderTransaction(callbackHadler, client, W_ID, D_ID, C_ID, NUM_ITEMS, ITEM_NUMBER, SUPPLIER_WAREHOUSE, QUANTITY) {

    //STEP 1
    var N = 0;
    await client.query('SELECT D_NEXT_O_ID FROM Districts WHERE D_W_ID = ' + W_ID + ' AND D_ID = ' + D_ID).then(res => {
        N = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });

    //STEP 2
    let nPlusOne = N + 1; 
    await client.query('UPDATE Districts SET D_NEXT_O_ID = ' + nPlusOne).catch(err => {
        console.error(err.stack);
    });

    //STEP 3
    let date_obj = Date.now();
    var O_ALL_LOCAL = 1;
    for (var i = 1; i <= SUPPLIER_WAREHOUSE.length; i++) {
        if (SUPPLIER_WAREHOUSE[i] != W_ID) {
            O_ALL_LOCAL = 0;
        }
    }
    var createNewOrderStmt = 'INSERT INTO Orders VALUES (' + N + ',' + D_ID + ',' + W_ID + ',' + C_ID + ',' + date_obj + ', NULL,' + NUM_ITEMS + ',' + O_ALL_LOCAL + ')';
    await client.query(createNewOrderStmt).catch(err => {
        console.error(err.stack);
    });

    //STEP 4
    var TOTAL_AMOUNT = 0;

    //STEP 5
    for (var i = 1; i <= NUM_ITEMS; i++) {

        //PART A
        let ITEM_NO = ITEM_NUMBER[i];
        let WAREHOUSE = SUPPLIER_WAREHOUSE[i];
        var S_QUANTITY = 0;
        await client.query('SELECT S_QUANTITY FROM Stocks WHERE S_W_ID = ' + WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO).then(res => {
            S_QUANTITY = res.rows[0];
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
            I_PRICE = res.rows[0];
        }).catch(err => {
            console.error(err.stack);
        });
        var ITEM_AMOUNT = QUANTITY[i] * I_PRICE;

        //PART F
        TOTAL_AMOUNT = TOTAL_AMOUNT + ITEM_AMOUNT;

        //PART G
        var OL_DIST_INFO = '';
        await client.query('SELECT S_DIST_'+ D_ID + ' FROM Stocks').then(res => {
            OL_DIST_INFO = res.rows[0];
        }).catch(err => {
            console.error(err.stack);
        });
        var createNewOrderLineStmt = 'INSERT INTO Order_Lines VALUES (' + N + ',' + D_ID + ',' + W_ID + ',' + i + ',' + ITEM_NO + ',' + WAREHOUSE + ',' + QUANTITY[i] + ',' + ITEM_AMOUNT + ', NULL,' +  OL_DIST_INFO;
        await client.query(createNewOrderLineStmt).catch(err => {
            console.error(err.stack);
        });
    }

    //STEP 6
    var W_TAX = 0;
    await client.query('SELECT W_TAX FROM Warehouses WHERE W_ID = ' + W_ID).then(res => {
        W_TAX = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });
    var D_TAX = 0;
    await client.query('SELECT D_TAX FROM Districts WHERE D_ID = ' + D_ID).then(res => {
        D_TAX = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });
    var C_DISCOUNT = 0;
    await client.query('SELECT C_DISCOUNT FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_DISCOUNT = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });
    TOTAL_AMOUNT = TOTAL_AMOUNT * (1 + D_TAX + W_TAX) * (1 - C_DISCOUNT);

    
    console.log('>>>> NEW ORDER TRANSACTION');

    //OUTPUT STEP 1
    var C_LAST = 0;
    await client.query('SELECT C_LAST FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_LAST = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });
    var C_CREDIT = 0;
    await client.query('SELECT C_CREDIT FROM Customers WHERE C_ID = ' + C_ID).then(res => {
        C_CREDIT = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });
    console.log('Customer Identifier(' + W_ID + ',' + D_ID + ',' + C_ID + '), LastName ' + C_LAST + ', Credit ' + C_CREDIT + ', Discount '  + C_DISCOUNT);

    //OUTPUT STEP 2
    console.log('Warehouse Tax Rate ' + W_TAX + ', District Tax Rate ' + D_TAX);

    //OUTPUT STEP 3
    console.log('Order Number ' + N + ', Entry Date ' + date_obj);

    //OUTPUT STEP 4
    console.log('Number of Items ' + NUM_ITEMS + ', Total Amount for Order ' + TOTAL_AMOUNT);

    //OUTPUT STEP 5
    for (var i = 1; i < NUM_ITEMS; i++) {
    var ITEM_NO = ITEM_NUMBER[i];
    var I_NAME = 0;
    await client.query('SELECT I_NAME FROM Items WHERE I_ID = ' + ITEM_NO).then(res => {
        I_NAME = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });
    var I_PRICE = 0;
    await client.query('SELECT I_PRICE FROM Items Where I_ID = ' + ITEM_NO).then(res => {
        I_PRICE = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });
    var OL_AMOUNT = QUANTITY[i] * I_PRICE;
    var S_QUANTITY = 0;
    await client.query('SELECT S_QUANTITY FROM Stocks WHERE S_W_ID = ' + W_ID + ' AND S_I_ID = ' + ITEM_NO).then(res => {
        S_QUANTITY = res.rows[0];
    }).catch(err => {
        console.error(err.stack);
    });

    console.log(ITEM_NO + ', ' + I_NAME + ', ' + SUPPLIER_WAREHOUSE[i] + ', ' + QUANTITY[i] + ', ' + OL_AMOUNT + ', ' + S_QUANTITY);    
    }
}

module.exports = { newOrderTransaction };