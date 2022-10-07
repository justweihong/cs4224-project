#! /bin/sh
../yugabyte-2.14.1.0/bin/ysqlsh -c 'DROP DATABASE IF EXISTS supplier_db;'
../yugabyte-2.14.1.0/bin/ysqlsh -c 'CREATE DATABASE supplier_db;'
../yugabyte-2.14.1.0/bin/ysqlsh -d supplier_db -f ./ysql/setup/ysqlsetup.sql
