#! /bin/sh
../bin/ysqlsh -c 'DROP DATABASE IF EXISTS supplier_db;'
../bin/ysqlsh -c 'CREATE DATABASE supplier_db;'
../bin/ysqlsh -d supplier_db -f ./ysql/setup/ysqlsetup.sql