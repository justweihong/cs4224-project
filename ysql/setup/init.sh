#! /bin/sh
/temp/yugabyte-2.14.1.0/bin/ysqlsh -h 127.0.1.1 -c 'DROP DATABASE IF EXISTS supplier_db;'
/temp/yugabyte-2.14.1.0/bin/ysqlsh -h 127.0.1.1 -c 'CREATE DATABASE supplier_db;'
/temp/yugabyte-2.14.1.0/bin/ysqlsh -h 127.0.1.1 -d supplier_db -f ~/cs4224-project/ysql/setup/ysqlsetup.sql