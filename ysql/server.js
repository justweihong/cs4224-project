<<<<<<< HEAD
var pg = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');

const { newOrderTransaction } = require('./transactions/newOrderTransaction');
const { paymentTransaction } = require('./transactions/paymentTransaction');
const { deliveryTransaction } = require('./transactions/deliveryTransaction');
const { orderStatusTransaction } = require('./transactions/orderStatusTransaction');
const { stockLevelTransaction } = require('./transactions/stockLevelTransaction');
const { popularItemTransaction } = require('./transactions/popularItemTransaction');
const { topBalanceTransaction } = require('./transactions/topBalanceTransaction');
const { relatedCustomerTransaction } = require('./transactions/relatedCustomerTransaction');

const { executeFunction } = require('./util/executeFunction');
const { measurePerformance } = require('./util/measurePerformance');
const { outputClients } = require('./util/outputClients');
const { outputThroughput } = require('./util/outputThroughput');
const { generateDBState } = require('./util/generateDBState');

// Confighost: '192.168.48.219',
const config = {
    host: '192.168.48.219',
    port: '6433',
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

var clients = [];

async function connect(callbackHandler) {
    console.log('>>>> Connecting to YugabyteDB!');

    try {
        for (let i = 0; i < 20; i++) {
            client = new pg.Client(config);
            await client.connect();
            clients.push(client);
        }

        console.log('>>>> Connected to YugabyteDB!');

        callbackHandler();
    } catch (err) {
        callbackHandler(err);
    }
}

async function parser(clientNo) {
    return new Promise((resolve, reject) => {
        const filePath = `../project_files/xact_files/${clientNo}.txt`;
        fs.readFile(filePath, 'utf8', async function (err,data) {
    
        // Return error for invalid file
        if (err) {
            reject(err);
        }
    
        const lines = data.split(/\r?\n/);
    
        // Variables for NewOrderTransaction
        let orderDetails;
        let itemsLeft = -1;
        let itemNumberList = [];
        let supplierWarehouseList = [];
        let quantityList = [];
        let lineCount = 0; //! DEBUG PURPOSES

    
    
        // Benchmarking Metrics
        let txnLatencies = []; // in ms
    
        // Execute transactions
        for (const line of lines) {
            lineCount++;
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
                const txnLatency = await executeFunction(newOrderTransaction, clients[clientNo], [orderDetails[1], orderDetails[2], orderDetails[0], orderDetails[3], itemNumberList, supplierWarehouseList, quantityList])
                txnLatencies.push(txnLatency)
    
                itemNumberList = [];
                supplierWarehouseList = [];
                quantityList = [];
                itemsLeft--;
            }
    
            // Transactions
            let txnLatency;
            switch(args[0]) {
                case TransactionTypes.NEW_ORDER:
                    orderDetails = args.slice(1);
                    itemsLeft = args[4];
                    break;
    
                case TransactionTypes.PAYMENT:
                    console.log('Running Payment Transaction, Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3] + ' Payment Amount: ' + args[4]);
                    txnLatency = await executeFunction(paymentTransaction, clients[clientNo], args.slice(1));
					txnLatencies.push(txnLatency)
                    break;
    
                case TransactionTypes.DELIVERY:
                    console.log('Running Delivery Transaction, Arguments: W_ID: ' + args[1] + ' Carrier_ID: ' + args[2]);
                    txnLatency = await executeFunction(deliveryTransaction, clients[clientNo], args.slice(1));
					txnLatencies.push(txnLatency)
                    break;
    
                case TransactionTypes.ORDER_STATUS:
                    console.log('Running Order Status Transaction, Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3]);
                    txnLatency = await executeFunction(orderStatusTransaction, clients[clientNo], args.slice(1));
					txnLatencies.push(txnLatency)
                    break;
    
                case TransactionTypes.STOCK_LEVEL: 
                    console.log('Running Stock Level Transaction, Arguments: W_ID: ' + args[1] + ' D_ID: ' + args[2] + ' Threshold: ' + args[3] + ' no of last orders examined: ' + args[4]);
                    txnLatency = await executeFunction(stockLevelTransaction, clients[clientNo], args.slice(1));
					txnLatencies.push(txnLatency)
                    break;
				
				case TransactionTypes.POPULAR_ITEM: 
                    console.log('Running Popular Item Transaction, Arguments: W_ID: ' + args[1] + ' D_ID: ' + args[2] + ' no of last orders examined: ' + args[3]);
                    txnLatency = await executeFunction(popularItemTransaction, clients[clientNo], args.slice(1));
					txnLatencies.push(txnLatency)
                    break;
					
				case TransactionTypes.TOP_BALANCE: 
                    console.log('Running Top Balance Transaction, Arguments: [none]');
                    txnLatency = await executeFunction(topBalanceTransaction, clients[clientNo], args.slice(1));
					txnLatencies.push(txnLatency)
                    break;
				
				case TransactionTypes.RELATED_CUSTOMER: 
                    console.log('Running Related Customer Transaction, Arguments: Arguments: C_W_ID: ' + args[1] + ' C_D_ID: ' + args[2] + ' C_ID: ' + args[3]);
                    txnLatency = await executeFunction(relatedCustomerTransaction, clients[clientNo], args.slice(1));
					txnLatencies.push(txnLatency)
                    break;
            }
        }
    
        // Record Benchmarking Metrics
        const performanceMetrics = await measurePerformance(txnLatencies, clientNo);
        resolve(performanceMetrics);
    })

    });
}

async.series([
    // Connect to database
    function (callbackHandler) {
        connect(callbackHandler);
    },

    // Run client drivers
    function (callbackHandler) {
        const clientNumbers = [...Array(20).keys()]

        const clientPrograms = clientNumbers.map( clientNo => parser(clientNo));

        // Wait for all of them to be completed
        Promise.all(clientPrograms)
            .then(async (allPerformanceMetrics) => {
                await outputClients(allPerformanceMetrics, './clients.csv');
                await outputThroughput(allPerformanceMetrics, './throughput.csv')
                await generateDBState(client, './dbstate.csv')
                callbackHandler("5. END OF BENCHMARKING")
            })
    },
    
],
    function (err) {
        if (err) {
            console.error(err);
        }
        //client.end();
    }
);
