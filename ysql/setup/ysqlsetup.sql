\i /home/stuproj/cs4224a/cs4224-project/ysql/setup/schema.sql
\copy warehouses from '/home/stuproj/cs4224a/cs4224-project/project_files/data_files/warehouse.csv' with (format csv, delimiter ',', null 'null', rows_per_transaction 1000, disable_fk_check);
\copy districts from '/home/stuproj/cs4224a/cs4224-project/project_files/data_files/district.csv' with (format csv, delimiter ',', null 'null', rows_per_transaction 1000, disable_fk_check);
\copy customers from '/home/stuproj/cs4224a/cs4224-project/project_files/data_files/customer.csv'with (format csv, delimiter ',', null 'null', rows_per_transaction 1000, disable_fk_check);
\copy orders from '/home/stuproj/cs4224a/cs4224-project/project_files/data_files/order.csv' with (format csv, delimiter ',', null 'null', rows_per_transaction 1000, disable_fk_check);
\copy items from '/home/stuproj/cs4224a/cs4224-project/project_files/data_files/item.csv' with (format csv, delimiter ',', null 'null', rows_per_transaction 1000, disable_fk_check);
\copy order_lines from '/home/stuproj/cs4224a/cs4224-project/project_files/data_files/order-line.csv' with (format csv, delimiter ',', null 'null', rows_per_transaction 1000, disable_fk_check);
\copy stocks from '/home/stuproj/cs4224a/cs4224-project/project_files/data_files/stock.csv' with (format csv, delimiter ',', null 'null', rows_per_transaction 1000, disable_fk_check);    