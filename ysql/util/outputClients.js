const fs = require('fs');

async function outputClients(allPerformanceMetrics, filePath) {
    // Sort by ascending order of clientNo
    allPerformanceMetrics.sort((a, b) => a[0] - b[0])
    csvStringArray = allPerformanceMetrics.map(performanceMetrics => performanceMetrics.join(','));
    csvString = csvStringArray.join('\n');
    fs.writeFile(filePath, csvString, err => {
        if (err) {
            console.error(err);
        }
    })
}

module.exports = { outputClients };