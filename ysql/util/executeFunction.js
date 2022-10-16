/**
 * Acts as a function wrapper for transaction methods so that the performance metrics can be recorded.
 * @param {*} txnMethod Transaction method
 * @param {*} client pg.Client
 * @param {*} args Transaction method arguments
 * @returns transaction latency (in ms).
 */
 async function executeFunction(txnMethod, client, args) {
    const startTime = performance.now();
    await txnMethod(client, ...args);
    const endTime = performance.now();
    return endTime - startTime
}

module.exports = { executeFunction };