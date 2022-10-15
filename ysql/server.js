var pg = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');
const { newOrderTransaction } = require('./transactions/newOrderTransaction');
const { paymentTransaction } = require('./transactions/PaymentTransaction');
const { deliveryTransaction } = require('./transactions/DeliveryTransaction');
const { orderStatusTransaction } = require('./transactions/OrderStatusTransaction');
const { stockLevelTransaction } = require('./transactions/StockLevelTransaction');
const { sum, mean, median, q95, q99, sort } = require('./util/math');

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

async function parser(callbackHandler, clientNo) {
    const filePath = '../project_files/xact_files/' + clientNo + '.txt';
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


    // Benchmarking Metrics
    let txnLatencies = []; // in ms

    // Execute transactions
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
            const timeTaken = await executeFunction(newOrderTransaction, client, [orderDetails[1], orderDetails[2], orderDetails[0], orderDetails[3], itemNumberList, supplierWarehouseList, quantityList])
            txnLatencies.push(timeTaken)

            itemNumberList = [];
            supplierWarehouseList = [];
            quantityList = [];
            itemsLeft--;
        }

        // Transactions
        let timeTaken;
        switch(args[0]) {
            case TransactionTypes.NEW_ORDER:
                orderDetails = args.slice(1);
                itemsLeft = args[4];
                break;

            case TransactionTypes.PAYMENT:
                console.log('Running Payment Transaction, Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3] + ' Payment Amount: ' + args[4]);
                timeTaken = await executeFunction(paymentTransaction, client, args.slice(1));
                break;

            case TransactionTypes.DELIVERY:
                console.log('Running Delivery Transaction, Arguments: W_ID: ' + args[1] + ' Carrier_ID: ' + args[2]);
                timeTaken = await executeFunction(deliveryTransaction, client, args.slice(1));
                break;

            case TransactionTypes.ORDER_STATUS:
                console.log('Running Order Status Transaction Statement, Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3]);
                timeTaken = await executeFunction(orderStatusTransaction, client, args.slice(1));
                break;

            case TransactionTypes.STOCK_LEVEL: 
                console.log('Running Stock Level Transaction Statement, Arguments: W_ID: ' + args[1] + ' D_ID: ' + args[2] + ' Threshold: ' + args[3] + ' no of last orders examined: ' + args[4]);
                timeTaken = await executeFunction(stockLevelTransaction, client, args.slice(1));
                break;
            // case TransactionTypes.POPULAR_ITEM:
            // case TransactionTypes.TOP_BALANCE:
            // case TransactionTypes.RELATED_CUSTOMER:
        }
        txnLatencies.push(timeTaken)
    }

    // Record Benchmarking Metrics
    await measurePerformance(txnLatencies, clientNo);


    // End Parsing
    callbackHandler();
    });
}

/**
 * Acts as a function wrapper for transaction methods so that the performance metrics can be recorded.
 * @param {*} txnMethod Transaction method
 * @param {*} client pg.Client
 * @param {*} args Transaction method arguments
 * @returns transaction latency (in ms).
 */
async function executeFunction(txnMethod, client, args) {
    const startTime = performance.now();
    await txnMethod(client, ...args);
    const endTime = performance.now();
    return endTime - startTime
}

async function measurePerformance(txnLatencies, clientNo) {
    // Measure performance
    const noOfExecutedTxn = txnLatencies.length.toFixed(2);
    const totalTxnExecutionTime = (sum(txnLatencies)/1000).toFixed(2) ; // In seconds
    const txnThroughput = (noOfExecutedTxn/totalTxnExecutionTime).toFixed(2);
    const averageTxnLatency = mean(txnLatencies).toFixed(2);
    const medianTxnLatency = median(txnLatencies).toFixed(2);
    const percentile95 = q95(txnLatencies).toFixed(2); 
    const percentile99 = q99(txnLatencies).toFixed(2); 

    // Driver outpurs to stderr
    console.error('Total number of transactions processed:', noOfExecutedTxn);
    console.error('Total elapsed time for processing the transactions (in seconds):', totalTxnExecutionTime);
    console.error('Transaction throughput (number of transactions processed per second:', txnThroughput);
    console.error('Average transaction latency (in ms):', averageTxnLatency);
    console.error('Median transaction latency (in ms):', medianTxnLatency);
    console.error('95th percentile transaction latency (in ms):', percentile95);
    console.error('99th percentil transaction latency (in ms):', percentile99);

    // Record performance in csv
    var csvString = [clientNo, noOfExecutedTxn, totalTxnExecutionTime, txnThroughput, averageTxnLatency, medianTxnLatency, percentile95, percentile99].join(',');
    const filePath = './clients.csv';
    if (fs.existsSync(filePath)) { // Write in a new line only if there is data in clients.csv
        csvString = '\n' + csvString
    }
    fs.appendFile(filePath, csvString, err => { // Asynchronouse file append (because there is 20 clients)
        if (err) {
          console.error(err);
        }
    });
    
}

async.series([
    function (callbackHandler) {
        connect(callbackHandler);
    },
    function (callbackHandler) {
        parser(callbackHandler, 20);
    },
    
],
    function (err) {
        if (err) {
            console.error(err);
        }
        //client.end();
    }
);
