#! /bin/sh
../yugabyte-2.14.1.0/bin/ysqlsh -h 192.168.48.223 -p 6433 -c 'DROP DATABASE IF EXISTS supplier_db;'
../yugabyte-2.14.1.0/bin/ysqlsh -h 192.168.48.223 -p 6433 -c 'CREATE DATABASE supplier_db;'
../yugabyte-2.14.1.0/bin/ysqlsh -h 192.168.48.223 -p 6433 -d supplier_db -f ./ysql/setup/ysqlsetup.sql