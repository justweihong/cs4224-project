CREATE TABLE IF NOT EXISTS warehouses (
    w_id integer,
    w_name varchar,
    w_street_1 varchar,
    w_street_2 varchar,
    w_city varchar,
    w_state varchar,
    w_zip varchar,
    w_tax decimal,
    w_ytd decimal,
    PRIMARY KEY (w_id)
) WITH transactions = { 'enabled' : true };

CREATE TABLE IF NOT EXISTS districts (
    d_w_id integer,
    d_id integer,
    d_name varchar,
    d_street_1 varchar,
    d_street_2 varchar,
    d_city varchar,
    d_state varchar,
    d_zip varchar,
    d_tax decimal,
    d_ytd decimal,
    d_next_o_id integer,
    PRIMARY KEY (d_w_id, d_id)
) WITH transactions = { 'enabled' : true };

CREATE TABLE IF NOT EXISTS customers (
    c_w_id integer,
    c_d_id integer,
    c_id integer,
    c_first varchar,
    c_middle varchar,
    c_last varchar,
    c_street_1 varchar,
    c_street_2 varchar,
    c_city varchar,
    c_state varchar,
    c_zip varchar,
    c_phone varchar,
    c_since timestamp,
    c_credit varchar,
    c_credit_limit decimal,
    c_discount decimal,
    c_balance decimal,
    c_ytd_payment float,
    c_payment_cnt integer,
    c_delivery_cnt integer,
    c_data varchar,
    PRIMARY KEY ((c_w_id, c_d_id), c_id)
) WITH transactions = { 'enabled' : true };

CREATE TABLE IF NOT EXISTS orders (
    o_w_id integer,
    o_d_id integer,
    o_id integer,
    o_c_id integer,
    o_carrier_id integer,
    o_ol_cnt decimal,
    o_all_local decimal,
    o_entry_d timestamp,
    PRIMARY KEY ((o_w_id, o_d_id), o_id)
);

CREATE TABLE IF NOT EXISTS items (
    i_id integer,
    i_name varchar,
    i_price decimal,
    i_im_id integer,
    i_data varchar,
    PRIMARY KEY (i_id)
) WITH transactions = { 'enabled' : true };

CREATE TABLE IF NOT EXISTS order_lines (
    ol_w_id integer,
    ol_d_id integer,
    ol_o_id integer,
    ol_number integer,
    ol_i_id integer,
    ol_delivery_d timestamp,
    ol_amount decimal,
    ol_supply_w_id integer,
    ol_quantity decimal,
    ol_dist_info varchar,
    PRIMARY KEY ((ol_w_id, ol_d_id), ol_o_id, ol_number)
) WITH transactions = { 'enabled' : true };

CREATE TABLE IF NOT EXISTS stocks (
    s_w_id integer,
    s_i_id integer,
    s_quantity decimal,
    s_ytd decimal,
    s_order_cnt integer,
    s_remote_cnt integer,
    s_dist_01 varchar,
    s_dist_02 varchar,
    s_dist_03 varchar,
    s_dist_04 varchar,
    s_dist_05 varchar,
    s_dist_06 varchar,
    s_dist_07 varchar,
    s_dist_08 varchar,
    s_dist_09 varchar,
    s_dist_10 varchar,
    s_data varchar,
    PRIMARY KEY (s_w_id, s_i_id)
) WITH transactions = { 'enabled' : true };