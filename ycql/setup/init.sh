#! /bin/sh
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP TABLE IF EXISTS supplier_db.warehouses;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP TABLE IF EXISTS supplier_db.districts;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP TABLE IF EXISTS supplier_db.customers;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP TABLE IF EXISTS supplier_db.orders;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP TABLE IF EXISTS supplier_db.items;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP TABLE IF EXISTS supplier_db.order_lines;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP TABLE IF EXISTS supplier_db.stocks;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'DROP KEYSPACE IF EXISTS supplier_db;'
../yugabyte-2.14.1.0/bin/ycqlsh -e 'CREATE KEYSPACE supplier_db;'
../yugabyte-2.14.1.0/bin/ycqlsh -k supplier_db -f ./ycql/setup/ycqlsetup.cql