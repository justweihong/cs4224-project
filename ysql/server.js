var pg = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');

const config = {
    host: '127.0.0.1',
    port: '5433',
    database: 'yugabyte',
    user: 'yugabyte',
    password: 'yugabyte',
    // Uncomment and initialize the SSL settings for YugabyteDB Managed and other secured types of deployment
    // ssl: {
    //     rejectUnauthorized: true,
    //     ca: fs.readFileSync('path_to_your_root_certificate').toString()
    // },
    connectionTimeoutMillis: 5000
};

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});



var client;

async function connect(callbackHadler) {
    console.log('>>>> Connecting to YugabyteDB!');

    try {
        client = new pg.Client(config);

        await client.connect();

        console.log('>>>> Connected to YugabyteDB!');

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async function newOrderTransaction(callbackHadler, W_ID, D_ID, C_ID, NUM_ITEMS, ITEM_NUMBER, SUPPLIER_WAREHOUSE, QUANTITY) {

    //STEP 1
    let N = await client.query('SELECT D_NEXT_O_ID FROM District WHERE W_ID = ' + W_ID + ' AND D_ID = ' + D_ID);
   
    //STEP 2
    let nPlusOne = N + 1; 
    await client.query('UPDATE District SET D_NEXT_O_ID = ' + nPlusOne);
   
    //STEP 3
    let date_obj = Date.now();
    var O_ALL_LOCAL = 1;
    for (var i = 1; i <= SUPPLIER_WAREHOUSE.length; i++) {
     if (SUPPLIER_WAREHOUSE[i] != W_ID) {
      O_ALL_LOCAL = 0;
     }
    }
    var createNewOrderStmt = 'INSERT INTO Order VALUES (' + N + ',' + D_ID + ',' + W_ID + ',' + C_ID + ',' + date_obj + ',' + NULL + ',' + NUM_ITEMS + ',' + O_ALL_LOCAL + ')';
    await client.query(createNewOrderStmt);
   
    //STEP 4
    var TOTAL_AMOUNT = 0;
   
    //STEP 5
    for (var i = 1; i <= NUM_ITEMS; i++) {
   
     //PART A
     let ITEM_NO = ITEM_NUMBER[i];
     let WAREHOUSE = SUPPLIER_WAREHOUSE[i];
     let S_QUANTITY = await client.query('SELECT S_QUANTITY FROM Stock WHERE S_W_ID = ' + WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO);
   
     //PART B
     var ADJUSTED_QTY = S_QUANTITY - QUANTITY[i];
     
     //PART C
     if (ADJUSTED_QTY < 10) {
      ADJUSTED_QTY = ADJUSTED_QTY + 100;
     }
   
     //PART D
     var updateStockStmt = "";
     if (SUPPLIER_WAREHOUSE[i] != W_ID) {
      updateStockStmt = 'UPDATE Stock SET S_QUANTITY = ' + ADJUSTED_QTY + 
      ', S_YTD = S_YTD + ' + QUANTITY[i] + ', S_ORDER_CNT = S_ORDER_CNT + 1, S_REMOTE_CNT = S_REMOTE_CNT + 1 WHERE S_W_ID = ' + 
      WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO;
     } else {
      updateStockStmt = 'UPDATE Stock SET S_QUANTITY = ' + ADJUSTED_QTY + 
      ', S_YTD = S_YTD + ' + QUANTITY[i] + ', S_ORDER_CNT = S_ORDER_CNT + 1 WHERE S_W_ID = ' + 
      WAREHOUSE + ' AND S_I_ID = ' + ITEM_NO;
     }
     await client.query(updateStockStmt);
   
     //PART E
     var I_PRICE = await client.query('SELECT I_PRICE FROM Item WHERE I_ID = ' + ITEM_NO);
     var ITEM_AMOUNT = QUANTITY[i] * I_PRICE;
   
     //PART F
     TOTAL_AMOUNT = TOTAL_AMOUNT + ITEM_AMOUNT;
   
     //PART G
     var OL_DIST_INFO = await client.query('SELECT S_DIST_'+ D_ID + ' FROM Stock');
     var createNewOrderLineStmt = 'INSERT INTO Order-Line VALUES (' + N + ',' + D_ID + ',' + W_ID + ',' + i + ',' + ITEM_NO + ',' + WAREHOUSE + ',' + QUANTITY[i] + ',' + ITEM_AMOUNT + ', NULL,' +  OL_DIST_INFO;
     await client.query(createNewOrderLineStmt);
    }
   
   
    //STEP 6
    var W_TAX = await client.query('SELECT W_TAX FROM Warehouse WHERE W_ID = ' + W_ID);
    var D_TAX = await client.query('SELECT D_TAX FROM District WHERE D_ID = ' + D_ID);
    var C_DISCOUNT = await client.query('SELECT C_DISCOUNT FROM Customer WHERE C_ID = ' + C_ID);
    TOTAL_AMOUNT = TOTAL_AMOUNT * (1 + D_TAX + W_TAX) * (1 - C_DISCOUNT);
   
    
    console.log('>>>> NEW ORDER TRANSACTION');
   
    //OUTPUT STEP 1
    var C_LAST = await client.query('SELECT C_LAST FROM Customer WHERE C_ID = ' + C_ID);
    var C_CREDIT = await client.query('SELECT C_CREDIT FROM Customer WHERE C_ID = ' + C_ID); 
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
     var I_NAME = await client.query('SELECT I_NAME FROM Item WHERE I_ID = ' + ITEM_NO);
     var I_PRICE = await client.query('SELECT I_PRICE FROM Item Where I_ID = ' + ITEM_NO);
     var OL_AMOUNT = QUANTITY[i] * I_PRICE;
     var S_QUANTITY = await client.query('SELECT S_QUANTITY FROM Stock WHERE S_W_ID = ' + W_ID + ' AND S_I_ID = ' + ITEM_NO);
   
     console.log(ITEM_NO + ', ' + I_NAME + ', ' + SUPPLIER_WAREHOUSE[i] + ', ' + QUANTITY[i] + ', ' + OL_AMOUNT + ', ' + S_QUANTITY);    
    }
}

async function wrapper(callbackHadler) {
    readline.question('', function(input) {
        let args = input.split(',');
        if (args[0] == 'N') {
            console.log('Running New Transaction Statement, Arguments:');
            console.log('W_ID: ' + args[1]);
            console.log('D_ID: ' + args[2]);
            console.log('C_ID: ' + args[3]);
            console.log('Number of Items: ' + args[4]);

            var itemsToProcess = [];
            for (var i=0; i < args[4]; i++) {
                readline.question('', function(item) {
                    itemsToProcess.push(item);
                });
            }

            console.log(itemsToProcess);
        } else if (args[0] == 'P') {

        } else if (args[0] == 'D') {

        } else if (args[0] == 'O') {

        } else if (args[0] == 'S') {

        } else if (args[0] == 'I') {

        } else if (args[0] == 'R') {

        } else {

        }
        readline.close();
    });
}


async.series([
    function (callbackHadler) {
        wrapper(callbackHadler);
    },
    function (callbackHadler) {
        connect(callbackHadler);
    },
],
    function (err) {
        if (err) {
            // Applies to logic of the transferMoneyBetweenAccounts method
            if (err.code == 40001) {
                console.error(
                    `The operation is aborted due to a concurrent transaction that is modifying the same set of rows.
                    Consider adding retry logic or using the pessimistic locking.`);
            }

            console.error(err);
        }
        client.end();
    }
);
