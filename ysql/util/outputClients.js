const fs = require('fs');

async function outputClients(allPerformanceMetrics, filePath) {
    console.log("4.1 REPORT CLIENTS STARTED");
    // Sort by ascending order of clientNo
    allPerformanceMetrics.sort((a, b) => a[0] - b[0])
    csvStringArray = allPerformanceMetrics.map(performanceMetrics => performanceMetrics.join(','));
    csvString = csvStringArray.join('\n');
    fs.writeFileSync(filePath, csvString, err => {
        if (err) {
            console.error(err);
        }
    })
    console.log("4.1 REPORT CLIENTS STARTED");
}

module.exports = { outputClients };