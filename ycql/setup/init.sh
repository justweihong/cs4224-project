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
../yugabyte-2.14.1.0/bin/ycqlsh -k supplier_db -f ./ycql/setup/schema.cql
./cassandra-loader -f ./project_files/data_files/warehouse.csv -schema "supplier_db.warehouses(w_id, w_name, w_street_1, w_street_2, w_city, w_state, w_zip, w_tax, w_ytd)" -configFile ./ycql/setup/loaderConfig -nullString "null"
./cassandra-loader -f ./project_files/data_files/district.csv -schema "supplier_db.districts(d_w_id, d_id, d_name, d_street_1, d_street_2, d_city, d_state, d_zip, d_tax, d_ytd, d_next_o_id)" -configFile ./ycql/setup/loaderConfig -nullString "null"
./cassandra-loader -f ./project_files/data_files/customer.csv -schema "supplier_db.customers(c_w_id, c_d_id, c_id, c_first, c_middle, c_last, c_street_1, c_street_2, c_city, c_state, c_zip, c_phone, c_since, c_credit, c_credit_limit, c_discount, c_balance, c_ytd_payment, c_payment_cnt, c_delivery_cnt, c_data)" -configFile ./ycql/setup/loaderConfig -batchSize 100 -rate 1000 -queryTimeout 10 -dateFormat "yyyy-MM-dd HH:mm:ss.SSS" -nullString "null"
./cassandra-loader -f ./project_files/data_files/order.csv -schema "supplier_db.orders(o_w_id, o_d_id, o_id, o_c_id, o_carrier_id, o_ol_cnt, o_all_local, o_entry_d)" -configFile ./ycql/setup/loaderConfig -batchSize 100 -rate 1000 -dateFormat "yyyy-MM-dd HH:mm:ss.SSS" -nullString "null"
./cassandra-loader -f ./project_files/data_files/item.csv -schema "supplier_db.items(i_id, i_name, i_price, i_im_id, i_data)" -configFile ./ycql/setup/loaderConfig -batchSize 5000 -nullString "null"
./cassandra-loader -f ./project_files/data_files/order-line.csv -schema "supplier_db.order_lines(ol_w_id, ol_d_id, ol_o_id, ol_number, ol_i_id, ol_delivery_d, ol_amount, ol_supply_w_id, ol_quantity, ol_dist_info)" -configFile ./ycql/setup/loaderConfig -batchSize 1000 -rate 1000 -dateFormat "yyyy-MM-dd HH:mm:ss.SSS" -nullString "null"
./cassandra-loader -f ./project_files/data_files/stock.csv -schema "supplier_db.stocks(s_w_id, s_i_id, s_quantity, s_ytd, s_order_cnt, s_remote_cnt, s_dist_01, s_dist_02, s_dist_03, s_dist_04, s_dist_05, s_dist_06, s_dist_07, s_dist_08, s_dist_09, s_dist_10, s_data)" -configFile ./ycql/setup/loaderConfig -batchSize 10000 -rate 25000 -nullString "null"