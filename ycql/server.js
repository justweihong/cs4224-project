var cassandra = require('cassandra-driver');
const async = require('async');
const fs = require('fs');
const { newOrderTransaction } = require('./transactions/newOrderTransaction');
const { paymentTransaction } = require('./transactions/PaymentTransaction');
const { deliveryTransaction } = require('./transactions/DeliveryTransaction');
const { orderStatusTransaction } = require('./transactions/OrderStatusTransaction');
const { stockLevelTransaction } = require('./transactions/StockLevelTransaction');
const { topBalanceTransacation } = require('./transactions/popularItemTransaction');
const { popularItemTransaction } = require('./transactions/topBalanceTransaction');

// Config
const config = {
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'supplier_db',
    credentials: { username: 'cassandra', password: 'cassandra' }
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
        client = new cassandra.Client(config);

        await client.connect();

        console.log('>>>> Connected to YugabyteDB!');

        callbackHandler();
    } catch (err) {
        callbackHandler(err);
    }
}

async function parser(callbackHandler, filePath) {
    fs.readFile(filePath, 'utf8', async function (err,data) {

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

    for (const line of lines) {
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
            console.log('Running New Order Transaction, Arguments:' + ' W_ID: ' + orderDetails[1] 
                + ' D_ID: ' + orderDetails[2] + ' C_ID: ' + orderDetails[0] + ' Number of Items: ' + orderDetails[3]);
            newOrderTransaction(callbackHandler, client, orderDetails[1], orderDetails[2], orderDetails[0], orderDetails[3], itemNumberList, supplierWarehouseList, quantityList);
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
                await paymentTransaction(client, ...args.slice(1));
                break;

            case TransactionTypes.DELIVERY:
                console.log('Running Delivery Transaction, Arguments: W_ID: ' + args[1] + ' Carrier_ID: ' + args[2]);
                await deliveryTransaction(client, ...args.slice(1));
                break;

            case TransactionTypes.ORDER_STATUS:
                console.log('Running Order Status Transaction Statement, Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3]);
                await orderStatusTransaction(client, ...args.slice(1));
                break;

            case TransactionTypes.STOCK_LEVEL: 
                console.log('Running Stock Level Transaction Statement, Arguments: W_ID: ' + args[1] + ' D_ID: ' + args[2] + ' Threshold: ' + args[3] + ' no of last orders examined: ' + args[4]);
                await stockLevelTransaction(client, ...args.slice(1));
                break;
            case TransactionTypes.POPULAR_ITEM:
                console.log(`Running Popular Item Transaction Statement, Arguments: W_ID: ${args[1]} D_ID: ${args[2]} L: ${args[3]}`);
                await getPopularItems(...args.slice(1));
                break;
            case TransactionTypes.TOP_BALANCE:
                console.log(`Running Top Balance Transaction Statement`);
                await getTopBalance();
                break;
            // case TransactionTypes.RELATED_CUSTOMER:
        }
    }

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
            console.error(err);
        }
        //client.end();
    }
);
