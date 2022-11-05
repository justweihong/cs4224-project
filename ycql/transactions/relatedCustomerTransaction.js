async function relatedCustomerTransaction(client, given_w_id, given_d_id, given_c_id) {
    try { 
		console.log('Printing related customers:');
		var relatedCount = 0;
		var stmt = `SELECT o_w_id, o_d_id, o_id, o_c_id FROM supplier_db.orders 
		WHERE 
		o_w_id = ${given_w_id} AND
		o_d_id = ${given_d_id} AND
		o_c_id = ${given_c_id}`;
		
		var givenCustomerOrders = (await client.execute(stmt)).rows;
		var givenCustomerOrderLines = [];
		
		for (order of givenCustomerOrders) {
			stmt = `SELECT ol_w_id, ol_d_id, ol_o_id, ol_i_id FROM supplier_db.order_lines
			WHERE
			ol_w_id = ${given_w_id} AND
			ol_d_id = ${given_d_id} AND
			ol_o_id = ${order.o_id}`;
		
			var givenCustomerOrderLinesPartial = (await client.execute(stmt)).rows;
			givenCustomerOrderLines.push(...givenCustomerOrderLinesPartial);
		}
	    for (p of Array(10).keys()) {
			
			if (p == given_w_id) {
				continue;
			}
			
			for (q of Array(10).keys()) {
				
				stmt = `SELECT o_w_id, o_d_id, o_id, o_c_id FROM supplier_db.orders 
				WHERE 
				o_w_id = ${p} AND
				o_d_id = ${q}`;
				
				var otherCustomerOrders = (await client.execute(stmt)).rows;
				var otherCustomerOrderLines = [];
				
				for (order of otherCustomerOrders) {
					stmt = `SELECT ol_w_id, ol_d_id, ol_o_id, ol_i_id FROM supplier_db.order_lines
					WHERE
					ol_w_id = ${p} AND
					ol_d_id = ${q} AND
					ol_o_id = ${order.o_id}`;
				
					order['commonItems'] = new Set();
					var otherCustomerOrderLinesPartial = (await client.execute(stmt)).rows;
					otherCustomerOrderLines.push(...otherCustomerOrderLinesPartial);
				}
						
				for (k = 0; k < otherCustomerOrderLines.length; k++) {
					var current = otherCustomerOrderLines[k];
					ol_c_id = otherCustomerOrders.find(el => (el.o_id == current.ol_o_id) && 
					(el.o_w_id == current.ol_w_id) && (el.o_d_id == current.ol_d_id)).o_c_id;
					current['ol_c_id'] = ol_c_id;
				}
				
				for (k = 0; k < otherCustomerOrders.length; k++) {
					var current = otherCustomerOrders[k];
					current['commonItemCount'] = 0;
				}
				
				for (i = 0; i < givenCustomerOrderLines.length; i++) {
					givenLine = givenCustomerOrderLines[i];
					for(j = 0; j < otherCustomerOrderLines.length; j++) {
						otherLine = otherCustomerOrderLines[j];
						
						if (givenLine.ol_i_id == otherLine.ol_i_id) {
							var otherOrder = otherCustomerOrders.find(el => (el.o_id == otherLine.ol_o_id) &&
							(el.o_w_id == otherLine.ol_w_id) && (el.o_d_id == otherLine.ol_d_id));
							otherOrder['commonItems'].add(otherLine.ol_i_id);
						}
					}
				}
			
				
				for (k = 0; k < otherCustomerOrders.length; k++) {
					var el = otherCustomerOrders[k];
					if(el['commonItems'].size >= 2) { 
						console.log('C_W_ID: ' + el.o_w_id + ' C_D_ID: ' + el.o_d_id + ' C_ID: ' + el.o_c_id);
						relatedCount = relatedCount + 1;
					}
				}
			}
		}
		
		if(relatedCount == 0) {
			console.log('No related customers found.');
		}
		
    } catch (err) {
        console.error(err.stack);
    }
}

module.exports = { relatedCustomerTransaction };