var pg = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');
const { orderStatusTransaction } = require('./transactions/OrderStatusTransaction');

// Config
const config = {
    host: '127.0.0.1',
    port: '9999',
    database: 'supplier_db',
    user: 'yugabyte',
    password: 'yugabyte',
    // Uncomment and initialize the SSL settings for YugabyteDB Managed and other secured types of deployment
    // ssl: {
    //     rejectUnauthorized: true,
    //     ca: fs.readFileSync('path_to_your_root_certificate').toString()
    // },
    connectionTimeoutMillis: 5000
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

async function parser(callbackHadler, filePath) {
    fs.readFile(filePath, 'utf8', function (err,data) {

    // Return error for invalid file
    if (err) {
        callbackHadler(err);
    }

    const lines = data.split(/\r?\n/);

    // Variables for NewOrderTransaction
    let orderDetails;
    let itemDetails = [];
    let itemsLeft = -1;
    
    lines.forEach(line => {
        let args = line.split(',');

        
        // Item line, add into items for new order transaction
        if (itemsLeft > 0) {
            itemDetails.push(args);
            itemsLeft--;
        
        // End of item lines, execute new order transaction
        } else if (itemsLeft == 0) {
            // TODO: execute new order transaction with orderDetails and itemDetails
            itemsLeft--;
        }

        // Transactions
        switch(args[0]) {
            case TransactionTypes.NEW_ORDER:
                orderDetails = args.slice(1);
                itemsLeft = args[4];
                break;

            // case TransactionTypes.PAYMENT: // TODO
            // case TransactionTypes.DELIVERY: // TODO
            case TransactionTypes.ORDER_STATUS:
                orderStatusTransaction(client, ...args.slice(1));
                break;

            // case TransactionTypes.STOCK_LEVEL: // TODO
            // case TransactionTypes.POPULAR_ITEM:
            // case TransactionTypes.TOP_BALANCE:
            // case TransactionTypes.RELATED_CUSTOMER:
        }
    })

    // End Parsing
    callbackHadler();
    });
}

async.series([
    // function (callbackHadler) {
    //     connect(callbackHadler);
    // },
    function (callbackHadler) {
        parser(callbackHadler, '../project_files/xact_files/0.txt');
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
