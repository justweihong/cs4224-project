SOURCE './ycql/setup/schema.cql';
COPY warehouses FROM './project_files/data_files/warehouse.csv' WITH DELIMITER = ',' AND NULL = 'null';
COPY districts FROM './project_files/data_files/district.csv' WITH DELIMITER = ',' AND NULL = 'null';
COPY customers FROM './project_files/data_files/customer.csv' WITH DELIMITER = ',' AND NULL = 'null' AND MAXBATCHSIZE = 100;
COPY orders FROM './project_files/data_files/order.csv' WITH DELIMITER = ',' AND NULL = 'null' AND MAXBATCHSIZE = 100;
COPY items FROM './project_files/data_files/item.csv' WITH DELIMITER = ',' AND NULL = 'null' AND MAXBATCHSIZE = 5000;
COPY order_lines FROM './project_files/data_files/order-line.csv' WITH DELIMITER = ',' AND NULL = 'null' AND MAXBATCHSIZE = 1000;
COPY stocks FROM './project_files/data_files/stock.csv' WITH DELIMITER = ',' AND NULL = 'null' AND MAXBATCHSIZE = 10000; 