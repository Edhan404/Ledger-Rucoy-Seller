// Advance Page Script
let charts = {};
let forecastCharts = {};
let forecastActive = {
    purchaseAll: false,
    salesAll: false,
    purchaseSingle: false,
    salesSingle: false
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializeAccountSelector();
    initializeCharts();
    updateCharts();
});

// Initialize account selector
function initializeAccountSelector() {
    const selector = document.getElementById('accountSelector');
    const accounts = dataManager.getAccounts();
    
    selector.innerHTML = '<option value="">-- Pilih Akun --</option>';
    accounts.forEach(account => {
        const option = document.createElement('option');
        option.value = account.id;
        option.textContent = account.name;
        selector.appendChild(option);
    });
}

// Initialize charts
function initializeCharts() {
    // All accounts - Purchases
    charts.purchaseAll = new Chart(document.getElementById('purchaseAllChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Gold Coins Used',
                data: [],
                borderColor: 'rgb(52, 152, 219)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Gold Coins Used for Purchases per Day'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // All accounts - Sales
    charts.salesAll = new Chart(document.getElementById('salesAllChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Realized Profit',
                data: [],
                borderColor: 'rgb(46, 204, 113)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Realized Profit from Sales per Day'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Single account - Purchases
    charts.purchaseSingle = new Chart(document.getElementById('purchaseSingleChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Gold Coins Used',
                data: [],
                borderColor: 'rgb(52, 152, 219)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Gold Coins Used for Purchases per Day'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Single account - Sales
    charts.salesSingle = new Chart(document.getElementById('salesSingleChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Realized Profit',
                data: [],
                borderColor: 'rgb(46, 204, 113)',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Realized Profit from Sales per Day'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update all charts
function updateCharts() {
    updateAllAccountsCharts();
    updateSingleAccountCharts();
}

// Update all accounts charts
function updateAllAccountsCharts() {
    const accounts = dataManager.getAccounts();
    const purchaseData = {};
    const salesData = {};

    accounts.forEach(account => {
        const transactions = dataManager.getTransactions(account.id);
        transactions.forEach(transaction => {
            const date = transaction.date;
            if (!purchaseData[date]) {
                purchaseData[date] = 0;
                salesData[date] = 0;
            }

            if (transaction.action === 'BUY') {
                purchaseData[date] += transaction.totalPrice;
            } else if (transaction.action === 'SELL') {
                // Calculate profit for this sale
                const profit = calculateSaleProfit(account.id, transaction);
                salesData[date] += profit;
            }
        });
    });

    const sortedDates = Object.keys(purchaseData).sort();
    const purchaseValues = sortedDates.map(date => purchaseData[date]);
    const salesValues = sortedDates.map(date => salesData[date]);

    charts.purchaseAll.data.labels = sortedDates;
    charts.purchaseAll.data.datasets[0].data = purchaseValues;
    charts.purchaseAll.update();

    charts.salesAll.data.labels = sortedDates;
    charts.salesAll.data.datasets[0].data = salesValues;
    charts.salesAll.update();
}

// Update single account charts
function updateSingleAccountCharts() {
    const accountId = parseInt(document.getElementById('accountSelector').value);
    if (!accountId) {
        charts.purchaseSingle.data.labels = [];
        charts.purchaseSingle.data.datasets[0].data = [];
        charts.purchaseSingle.update();

        charts.salesSingle.data.labels = [];
        charts.salesSingle.data.datasets[0].data = [];
        charts.salesSingle.update();
        return;
    }

    const transactions = dataManager.getTransactions(accountId);
    const purchaseData = {};
    const salesData = {};

    transactions.forEach(transaction => {
        const date = transaction.date;
        if (!purchaseData[date]) {
            purchaseData[date] = 0;
            salesData[date] = 0;
        }

        if (transaction.action === 'BUY') {
            purchaseData[date] += transaction.totalPrice;
        } else if (transaction.action === 'SELL') {
            const profit = calculateSaleProfit(accountId, transaction);
            salesData[date] += profit;
        }
    });

    const sortedDates = Object.keys(purchaseData).sort();
    const purchaseValues = sortedDates.map(date => purchaseData[date]);
    const salesValues = sortedDates.map(date => salesData[date]);

    charts.purchaseSingle.data.labels = sortedDates;
    charts.purchaseSingle.data.datasets[0].data = purchaseValues;
    charts.purchaseSingle.update();

    charts.salesSingle.data.labels = sortedDates;
    charts.salesSingle.data.datasets[0].data = salesValues;
    charts.salesSingle.update();
}

// Calculate sale profit
function calculateSaleProfit(accountId, saleTransaction) {
    const transactions = dataManager.getTransactions(accountId);
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );

    const buyTransactions = sortedTransactions
        .filter(t => t.itemName === saleTransaction.itemName && 
                    t.action === 'BUY' && 
                    new Date(t.date) <= new Date(saleTransaction.date))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    let remainingQuantity = saleTransaction.quantity;
    let totalCost = 0;

    for (const buy of buyTransactions) {
        if (remainingQuantity <= 0) break;
        const usedQuantity = Math.min(remainingQuantity, buy.quantity);
        const costPerUnit = buy.totalPrice / buy.quantity;
        totalCost += costPerUnit * usedQuantity;
        remainingQuantity -= usedQuantity;
    }

    return saleTransaction.totalPrice - totalCost;
}

// Toggle forecast
function toggleForecast(chartType) {
    forecastActive[chartType] = !forecastActive[chartType];
    
    if (forecastActive[chartType]) {
        showForecast(chartType);
    } else {
        hideForecast(chartType);
    }
}

// Show forecast
function showForecast(chartType) {
    const chart = charts[chartType];
    if (!chart) return;

    const data = chart.data.datasets[0].data;
    if (data.length === 0) return;

    // Calculate moving average (7-day)
    const forecastData = calculateMovingAverage(data, 7);
    const forecastLabels = [...chart.data.labels];
    
    // Add 7 future dates
    if (forecastLabels.length > 0) {
        const lastDate = new Date(forecastLabels[forecastLabels.length - 1]);
        for (let i = 1; i <= 7; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + i);
            forecastLabels.push(nextDate.toISOString().split('T')[0]);
        }
    }

    // Extend forecast data
    const lastValue = forecastData[forecastData.length - 1];
    const extendedForecast = [...forecastData];
    for (let i = 0; i < 7; i++) {
        extendedForecast.push(lastValue);
    }

    chart.data.datasets.push({
        label: 'Forecast (7-day MA)',
        data: extendedForecast,
        borderColor: 'rgb(231, 76, 60)',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderDash: [5, 5],
        tension: 0.4
    });

    chart.data.labels = forecastLabels;
    chart.update();
}

// Hide forecast
function hideForecast(chartType) {
    const chart = charts[chartType];
    if (!chart) return;

    if (chart.data.datasets.length > 1) {
        chart.data.datasets.pop();
        // Restore original labels
        const originalLength = chart.data.datasets[0].data.length;
        chart.data.labels = chart.data.labels.slice(0, originalLength);
        chart.update();
    }
}

// Calculate moving average
function calculateMovingAverage(data, period) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(data[i]);
        } else {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / period);
        }
    }
    return result;
}
