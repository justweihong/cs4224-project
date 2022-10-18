const fs = require("fs");

async function generateDBState(client) {
  var stat_queries = 
	['SELECT SUM(W_YTD) FROM Warehouses',
	'SELECT SUM(D_YTD) FROM Districts',
	'SELECT SUM(D_NEXT_O_ID) FROM Districts', 
	'SELECT SUM(C_BALANCE) FROM Customers',
	'SELECT SUM(C_YTD_PAYMENT) FROM Customers',
	'SELECT SUM(C_PAYMENT_CNT) FROM Customers', 
	'SELECT SUM(C_DELIVERY_CNT) FROM Customers',
    'SELECT MAX(O_ID) FROM Orders',
	'SELECT SUM(O_OL_CNT) FROM Orders',
	'SELECT SUM(OL_AMOUNT) FROM Order_Lines',
	'SELECT SUM(OL_QUANTITY) FROM Order_Lines',
    'SELECT SUM(S_QUANTITY) FROM Stocks',
	'SELECT SUM(S_YTD) FROM Stocks',
	'SELECT SUM(S_ORDER_CNT) FROM Stocks',
	'SELECT SUM(S_REMOTE_CNT) FROM Stocks'];
  var output = '';

  for (i = 0; i < stat_queries.length; i++) {
    var stat = await client.query(stat_queries[i]);
	if (i == 7) {
		statprintable = stat['rows'][0]['max']
	} else {
		statprintable = stat['rows'][0]['sum']
	}
	
    output += statprintable;
	
    if (i < stat_queries.length - 1) {
      output += '\r\n';
    }
  }
  fs.writeFileSync("dbstate.csv", output);
  console.log('finished')
}

module.exports = { generateDBState };