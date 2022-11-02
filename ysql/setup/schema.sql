CREATE TABLE IF NOT EXISTS warehouses (
    w_id integer NOT NULL,
    w_name varchar(10),
    w_street_1 varchar(20),
    w_street_2 varchar(20),
    w_city varchar(20),
    w_state char(2),
    w_zip char(9),
    w_tax decimal(4,4),
    w_ytd decimal(12,2),
    CONSTRAINT pk_warehouse PRIMARY KEY (w_id)
);
CREATE TABLE IF NOT EXISTS districts (
    d_w_id integer NOT NULL,
    d_id integer NOT NULL,
    d_name varchar(10),
    d_street_1 varchar(20),
    d_street_2 varchar(20),
    d_city varchar(20),
    d_state char(2),
    d_zip char(9),
    d_tax decimal(4,4),
    d_ytd decimal(12,2),
    d_next_o_id integer,
    CONSTRAINT pk_district PRIMARY KEY (d_w_id, d_id),
    CONSTRAINT fk_district_warehouse FOREIGN KEY (d_w_id)
    REFERENCES warehouses(w_id)
);
CREATE TABLE IF NOT EXISTS customers (
    c_w_id integer NOT NULL,
    c_d_id integer NOT NULL,
    c_id integer NOT NULL,
    c_first varchar(16),
    c_middle char(2),
    c_last varchar(16),
    c_street_1 varchar(20),
    c_street_2 varchar(20),
    c_city varchar(20),
    c_state char(2),
    c_zip char(9),
    c_phone char(16),
    c_since timestamp,
    c_credit char(2),
    c_credit_limit decimal(12,2),
    c_discount decimal(5,4),
    c_balance decimal(12,2),
    c_ytd_payment float,
    c_payment_cnt integer,
    c_delivery_cnt integer,
    c_data varchar(500),
    CONSTRAINT pk_customer PRIMARY KEY (c_w_id, c_d_id, c_id),
    CONSTRAINT fk_customer_district FOREIGN KEY (c_w_id, c_d_id)
    REFERENCES districts(d_w_id, d_id)
);
CREATE TABLE IF NOT EXISTS orders (
    o_w_id integer NOT NULL,
    o_d_id integer NOT NULL,
    o_id integer NOT NULL,
    o_c_id integer NOT NULL,
    o_carrier_id integer,
    o_ol_cnt decimal(12,2),
    o_all_local decimal(12,2),
    o_entry_d timestamp,
    CONSTRAINT pk_order PRIMARY KEY (o_w_id, o_d_id, o_id),
    CONSTRAINT fk_order_customer FOREIGN KEY (o_w_id, o_d_id, o_c_id)
    REFERENCES customers(c_w_id, c_d_id, c_id),
    CONSTRAINT carrier_id_check check(o_carrier_id >= 1 and o_carrier_id <= 10)
);
CREATE TABLE IF NOT EXISTS items (
    i_id integer NOT NULL,
    i_name varchar(24),
    i_price decimal(5,2),
    i_im_id integer,
    i_data varchar(50),
    CONSTRAINT pk_item PRIMARY KEY (i_id)
);
CREATE TABLE IF NOT EXISTS order_lines (
    ol_w_id integer NOT NULL,
    ol_d_id integer NOT NULL,
    ol_o_id integer NOT NULL,
    ol_number integer NOT NULL,
    ol_i_id integer NOT NULL,
    ol_delivery_d timestamp,
    ol_amount decimal(7,2),
    ol_supply_w_id integer NOT NULL,
    ol_quantity decimal(2,0),
    ol_dist_info char(24),
    CONSTRAINT pk_order_line PRIMARY KEY (ol_w_id, ol_d_id, ol_o_id, ol_number),
    CONSTRAINT fk_order_line_order FOREIGN KEY (ol_w_id, ol_d_id, ol_o_id)
    REFERENCES orders(o_w_id, o_d_id, o_id),
    CONSTRAINT fk_order_line_item FOREIGN KEY (ol_i_id)
    REFERENCES items(i_id)
);
CREATE INDEX ol_o_id_index ON order_lines(ol_o_id ASC);
CREATE TABLE IF NOT EXISTS stocks (
    s_w_id integer NOT NULL,
    s_i_id integer NOT NULL,
    s_quantity decimal(4,0),
    s_ytd decimal(8,2),
    s_order_cnt integer,
    s_remote_cnt integer,
    s_dist_01 char(24),
    s_dist_02 char(24),
    s_dist_03 char(24),
    s_dist_04 char(24),
    s_dist_05 char(24),
    s_dist_06 char(24),
    s_dist_07 char(24),
    s_dist_08 char(24),
    s_dist_09 char(24),
    s_dist_10 char(24),
    s_data varchar(50),
    CONSTRAINT pk_stock PRIMARY KEY (s_w_id, s_i_id),
    CONSTRAINT fk_stock_item FOREIGN KEY (s_i_id)
    REFERENCES items(i_id),
    CONSTRAINT fk_stock_warehouse FOREIGN KEY (s_w_id)
    REFERENCES warehouses(w_id)
);