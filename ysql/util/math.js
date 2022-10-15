const sort = arr => arr.sort((a, b) => a - b);

const sum = arr => arr.reduce((a, b) => a + b, 0);

const mean = arr => sum(arr) / arr.length;

const quantile = (arr, q) => {
    const sorted = sort(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base; // Get the remainder index if not exactly fall on one index
    // Use the remainder as proportion of the difference between index and index + 1
    if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]); 
    } else {
        return sorted[base];
    }
};

const median = arr => quantile(arr, .50);

const q95 = arr => quantile(arr, .95);

const q99 = arr => quantile(arr, .99);

module.exports = { sort, sum, mean, median, q95, q99 };