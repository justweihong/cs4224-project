const { sum, mean, median, q95, q99, sort } = require("./math");

/**
 * Measure performance of the client. Output to stderr and also return metrics.
 * @param {*} txnLatencies 
 * @param {*} clientNo 
 * @returns metrics [clientNo, noOfExecutedTxn, totalTxnExecutionTime, txnThroughput, averageTxnLatency, medianTxnLatency, percentile95, percentile99]
 */
async function measurePerformance(txnLatencies, clientNo) {
    // Measure performance
    const noOfExecutedTxn = txnLatencies.length.toFixed(2);
    const totalTxnExecutionTime = (sum(txnLatencies)/1000).toFixed(2) ; // In seconds
    const txnThroughput = (noOfExecutedTxn/totalTxnExecutionTime).toFixed(2);
    const averageTxnLatency = mean(txnLatencies).toFixed(2);
    const medianTxnLatency = median(txnLatencies).toFixed(2);
    const percentile95 = q95(txnLatencies).toFixed(2); 
    const percentile99 = q99(txnLatencies).toFixed(2); 

    // Driver outpurs to stderr
    console.error('Total number of transactions processed:', noOfExecutedTxn);
    console.error('Total elapsed time for processing the transactions (in seconds):', totalTxnExecutionTime);
    console.error('Transaction throughput (number of transactions processed per second:', txnThroughput);
    console.error('Average transaction latency (in ms):', averageTxnLatency);
    console.error('Median transaction latency (in ms):', medianTxnLatency);
    console.error('95th percentile transaction latency (in ms):', percentile95);
    console.error('99th percentil transaction latency (in ms):', percentile99);

    // Record performance in csv
    return [clientNo, noOfExecutedTxn, totalTxnExecutionTime, txnThroughput, averageTxnLatency, medianTxnLatency, percentile95, percentile99];
}

module.exports = { measurePerformance };