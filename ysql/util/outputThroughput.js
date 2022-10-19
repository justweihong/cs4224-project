const { mean } = require("./math");
const fs = require('fs');

async function outputThroughput(allPerformanceMetrics, filePath) {
    console.log("4.2 REPORT THROUGHPUT STARTED");
    // Sort by ascending order of throughput (index 3)
    const throughput_index = 3; 
    allPerformanceMetrics.sort((a,b) => Number(a[throughput_index]) - Number(b[throughput_index]));
    const throughputs = allPerformanceMetrics.map(performanceMetrics => Number(performanceMetrics[3]));
    const minThroughput = throughputs[0].toFixed(2);
    const maxThroughput = throughputs[throughputs.length - 1].toFixed(2);
    const avgThroughput = mean(throughputs).toFixed(2);
    csvString = [minThroughput, maxThroughput, avgThroughput].join(',');
    fs.writeFileSync(filePath, csvString, err => {
        if (err) {
            console.error(err);
        }
    })
    console.log("4.2 REPORT THROUGHPUT COMPLETED");
}

module.exports = { outputThroughput };