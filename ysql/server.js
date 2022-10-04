var pg = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');
const { newOrderTransaction } = require('./transactions/newOrderTransaction');
const { paymentTransaction } = require('./transactions/paymentTransaction');
const { deliveryTransaction } = require('./transactions/deliveryTransaction');
const { orderStatusTransaction } = require('./transactions/OrderStatusTransaction');

// Config
const config = {
    host: '127.0.0.1',
    port: '5433',
    database: 'supplier_db',
    user: 'yugabyte',
    password: 'yugabyte',
    // Uncomment and initialize the SSL settings for YugabyteDB Managed and other secured types of deployment
    // ssl: {
    //     rejectUnauthorized: true,
    //     ca: fs.readFileSync('path_to_your_root_certificate').toString()
    // },
    // connectionTimeoutMillis: 5000
};

// Transaction Types
const TransactionTypes = {
    NEW_ORDER: 'N',
    PAYMENT: 'P',
    DELIVERY: 'D',
    ORDER_STATUS: 'O',
    STOCK_LEVEL: 'S',
    POPULAR_ITEM: 'I',
    TOP_BALANCE: 'T',
    RELATED_CUSTOMER: 'R'
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

var client;

async function connect(callbackHandler) {
    console.log('>>>> Connecting to YugabyteDB!');

    try {
        client = new pg.Client(config);

        await client.connect();

        console.log('>>>> Connected to YugabyteDB!');

        callbackHandler();
    } catch (err) {
        callbackHandler(err);
    }
}

async function parser(callbackHandler, filePath) {
    fs.readFile(filePath, 'utf8', function (err,data) {

    // Return error for invalid file
    if (err) {
        callbackHandler(err);
    }

    const lines = data.split(/\r?\n/);

    // Variables for NewOrderTransaction
    let orderDetails;
    let itemsLeft = -1;
    let itemNumberList = [];
    let supplierWarehouseList = [];
    let quantityList = [];

    lines.forEach(line => {
        let args = line.split(',');
        
        // Item line, add into items for new order transaction
        if (itemsLeft > 0) {
            itemNumberList.push(args[0]);
            supplierWarehouseList.push(args[1]);
            quantityList.push(args[2]); 
            itemsLeft--;
        }
        
        // End of item lines, execute new order transaction
        if (itemsLeft == 0) {
            console.log('Running New Order Transaction, Arguments:' + ' W_ID: ' + orderDetails[0] 
                + ' D_ID: ' + orderDetails[1] + ' C_ID: ' + orderDetails[2] + ' Number of Items: ' + orderDetails[3]);
            newOrderTransaction(callbackHandler, client, orderDetails[0], orderDetails[1], orderDetails[2], orderDetails[3], itemNumberList, supplierWarehouseList, quantityList);
            itemNumberList = [];
            supplierWarehouseList = [];
            quantityList = [];
            itemsLeft--;
        }

        // Transactions
        switch(args[0]) {
            case TransactionTypes.NEW_ORDER:
                orderDetails = args.slice(1);
                itemsLeft = args[4];
                break;

            case TransactionTypes.PAYMENT:
                console.log('Running Payment Transaction, Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3] + ' Payment Amount: ' + args[4]);
                paymentTransaction(client, ...args.slice(1));
                break;

            case TransactionTypes.DELIVERY:
                console.log('Running Delivery Transaction, Arguments: W_ID: ' + args[1] + ' Carrier_ID: ' + args[2]);
                deliveryTransaction(client, ...args.slice(1));
                break;

            case TransactionTypes.ORDER_STATUS:
                console.log('Running Order Status Transaction Statement, Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3]);
                orderStatusTransaction(client, ...args.slice(1));
                break;

            // case TransactionTypes.STOCK_LEVEL: // TODO
            // case TransactionTypes.POPULAR_ITEM:
            // case TransactionTypes.TOP_BALANCE:
            // case TransactionTypes.RELATED_CUSTOMER:
        }
    })

    // End Parsing
    callbackHandler();
    });
}

async.series([
    function (callbackHandler) {
        connect(callbackHandler);
    },
    function (callbackHandler) {
        parser(callbackHandler, '../project_files/xact_files/test.txt');
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
        //client.end();
    }
);
