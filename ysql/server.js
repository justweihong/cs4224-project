var pg = require('pg');
const async = require('async');
const fs = require('fs');
const { callbackify } = require('util');
const { rows } = require('pg/lib/defaults');


//TODO: Update server to take in the transactions
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

async function createDatabase(callbackHadler) {
    try {
        var stmt = 'DROP TABLE IF EXISTS DemoAccount';

        await client.query(stmt);

        stmt = `CREATE TABLE DemoAccount (
            id int PRIMARY KEY,
            name varchar,
            age int,
            country varchar,
            balance int)`;

        await client.query(stmt);

        stmt = `INSERT INTO DemoAccount VALUES
            (1, 'Jessica', 28, 'USA', 10000),
            (2, 'John', 28, 'Canada', 9000)`;

        await client.query(stmt);

        console.log('>>>> Successfully created table DemoAccount.');

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async function selectAccounts(callbackHadler) {
    console.log('>>>> Selecting accounts:');

    try {
        const res = await client.query('SELECT name, age, country, balance FROM DemoAccount');
        var row;

        for (i = 0; i < res.rows.length; i++) {
            row = res.rows[i];

            console.log('name = %s, age = %d, country = %s, balance = %d',
                row.name, row.age, row.country, row.balance);
        }

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async function transferMoneyBetweenAccounts(callbackHadler, amount) {
    try {
        await client.query('BEGIN TRANSACTION');

        await client.query('UPDATE DemoAccount SET balance = balance - ' + amount + ' WHERE name = \'Jessica\'');
        await client.query('UPDATE DemoAccount SET balance = balance + ' + amount + ' WHERE name = \'John\'');
        await client.query('COMMIT');

        console.log('>>>> Transferred %d between accounts.', amount);

        callbackHadler();
    } catch (err) {
        callbackHadler(err);
    }
}

async function paymentTransaction(callbackHandler, c_w_id, c_d_id, c_id, payment) {
    try {
        await client.query('BEGIN TRANSACTION');
        // PROCESS 1
        await client.query('UPDATE warehouses SET w_ytd = w_ytd + ' + payment + ' WHERE w_id = ' + c_w_id);

        // PROCESS 2
        await client.query('UPDATE districts SET d_ytd = d_ytd + ' + payment + ' WHERE d_w_id = ' + c_w_id + ' AND d_id = ' + c_d_id);

        // PROCESS 3
        await client.query('UPDATE customers SET c_balance = c_balance - ' + payment 
            + ', c_ytd_payment = c_ytd_payment + ' + payment
            + ', c_payment_cnt = c_payment_cnt + 1 WHERE c_w_id = ' + c_w_id + ' AND c_d_id = ' + c_d_id + ' AND c_id = ' + c_id);

        await client.query('COMMIT');

        var row;
        // OUTPUT 1
        const customer_res = await client.query('SELECT * FROM customers WHERE c_w_id = ' + c_w_id + ' AND c_d_id = ' + c_d_id + ' AND c_id = ' + c_id);
        row = customer_res[0];
        console.log('Customer Identifier: (%d, %d, %d), Name: ($s, $s, $s)',
            c_w_id, c_d_id, c_id, row.c_first, row.c_middle, row.c_last);
        console.log('Address: (%s, %s, %s, %s, %s)',
            row.c_street_1, row.c_street_2, row.c_city, row.c_state, row.c_zip);
        console.log('Phone: $s, Since: %s, Credit: $s, Credit Limit: %f, Discount Rate: %f, Outstanding Payment: %f',
            row.c_phone, row.c_since, row.c_credit, row.c_credit_lim, row.c_discount, row.c_balance);
        
        // OUTPUT 2
        const warehouse_res = await client.query('SELECT * FROM warehouses WHERE w_id = ' + c_w_id);
        row = warehouse_res[0];
        console.log('Warehouse Address: (%s, %s, %s, %s, %s)',
            row.w_street_1, row.w_street_2, row.w_city, row.w_state, row.w_zip);
        
        // OUTPUT 3
        const district_res = await client.query('SELECT * FROM districts WHERE d_w_id = ' + c_w_id + ' AND d_id = ' + c_d_id);
        row = district_res[0];
        console.log('District Address: (%s, %s, %s, %s, %s)',
            row.d_street_1, row.d_street_2, row.d_city, row.d_state, row.d_zip);
        
        // OUTPUT 4
        console.log('Payment: %f', payment);

        callbackHandler();
    } catch (err) {
        callbackHandler(err);
    }
}

async function deliveryTransaction(callbackHandler, w_id, carrier_id) {
    try {
        await client.query('BEGIN TRANSACTION');
        for (i = 0; i < 10; i++) {
            // PROCESS 1a
            var order_no = await client.query('SELECT MIN(o_id) FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + i + 1 + ' AND o_carrier_id = ' + null);
            var cust_no = await client.query('SELECT o_c_id FROM orders WHERE o_w_id = ' + w_id + ' AND o_d_id = ' + i + 1 + ' AND o_id = ' + order_no); 

            // PROCESS 1b
            await client.query('UPDATE orders SET o_carrier_id = ' + carrier_id + ' WHERE o_id = ' + order_no);

            // PROCESS 1c
            await client.query('UPDATE order_lines SET ol_delivery_d = CURRENT_TIMESTAMP WHERE ol_o_id = ' + order_no);

            // PROCESS 1d
            var balance = await client.query('SELECT SUM(ol_amounnt) FROM order_lines WHERE ol_o_id = ' + order_no);
            await client.query('UPDATE customers SET c_balance = c_balance + ' + balance + ', c_delivery_cnt = c_delivery_cnt + 1 WHERE c_id = ' + cust_no);
        }

        await client.query('COMMIT');

        callbackHandler();
    } catch (err) {
        callbackHandler(err);
    }
}

async.series([
    function (callbackHadler) {
        connect(callbackHadler);
    },
    function (callbackHadler) {
        createDatabase(callbackHadler);
    },
    function (callbackHadler) {
        selectAccounts(callbackHadler);
    },
    function (callbackHadler) {
        transferMoneyBetweenAccounts(callbackHadler, 800);
    },
    function (callbackHadler) {
        selectAccounts(callbackHadler);
    }
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