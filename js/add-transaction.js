// Add Transaction Page Script
let currentAccountId = null;
let currentFilter = 'ALL';
let editingTransactionId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    currentAccountId = parseInt(sessionStorage.getItem('currentAccountId'));
    if (!currentAccountId) {
        alert('No account selected. Redirecting to portfolio...');
        window.location.href = 'index.html';
        return;
    }

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;

    updateTransactionsTable();
    updateSummary();
});

// Add transaction
function addTransaction(event) {
    event.preventDefault();
    
    const transaction = {
        date: document.getElementById('transactionDate').value,
        action: document.getElementById('transactionAction').value,
        itemName: document.getElementById('transactionItemName').value,
        tier: document.getElementById('transactionTier').value,
        quantity: parseInt(document.getElementById('transactionQuantity').value),
        totalPrice: parseFloat(document.getElementById('transactionTotalPrice').value),
        notes: document.getElementById('transactionNotes').value
    };

    if (editingTransactionId) {
        dataManager.updateTransaction(currentAccountId, editingTransactionId, transaction);
        editingTransactionId = null;
    } else {
        dataManager.addTransaction(currentAccountId, transaction);
    }

    clearTransactionForm();
    updateTransactionsTable();
    updateSummary();
}

// Clear form
function clearTransactionForm() {
    document.getElementById('transactionForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
    editingTransactionId = null;
}

// Update transactions table
function updateTransactionsTable() {
    const transactions = dataManager.getTransactions(currentAccountId);
    const filteredTransactions = filterTransactionsList(transactions);
    const tableBody = document.getElementById('transactionsTableBody');
    
    tableBody.innerHTML = '';

    // Sort by date
    const sortedTransactions = [...filteredTransactions].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        const actionClass = transaction.action === 'BUY' ? 'amount-blue' : 'amount-green';
        row.innerHTML = `
            <td>${transaction.itemName}</td>
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.tier}</td>
            <td class="${actionClass}">${transaction.action}</td>
            <td>${transaction.quantity}</td>
            <td>${formatNumber(transaction.totalPrice)}</td>
            <td>${formatNumber(calculateEquityAtTransaction(transaction.id))}</td>
            <td>
                <button class="btn btn-secondary" onclick="editTransaction(${transaction.id})" style="padding: 0.3rem 0.6rem; margin-right: 0.25rem;">Edit</button>
                <button class="btn btn-danger" onclick="deleteTransaction(${transaction.id})" style="padding: 0.3rem 0.6rem;">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter transactions
function filterTransactions(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.btn-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    updateTransactionsTable();
}

function filterTransactionsList(transactions) {
    if (currentFilter === 'ALL') return transactions;
    return transactions.filter(t => t.action === currentFilter);
}

// Calculate equity at a specific transaction
function calculateEquityAtTransaction(transactionId) {
    const account = dataManager.getAccount(currentAccountId);
    if (!account) return 0;

    const transactions = dataManager.getTransactions(currentAccountId);
    const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );

    let equity = account.initialEquity || 0;
    let found = false;

    for (const transaction of sortedTransactions) {
        if (transaction.id === transactionId) {
            found = true;
        }

        if (transaction.action === 'BUY') {
            equity -= transaction.totalPrice;
        } else if (transaction.action === 'SELL') {
            equity += transaction.totalPrice;
        }

        if (found) break;
    }

    return equity;
}

// Update summary
function updateSummary() {
    const transactions = dataManager.getTransactions(currentAccountId);
    const stats = dataManager.calculateAccountStats(currentAccountId);
    
    document.getElementById('transactionCount').textContent = `Total: ${transactions.length}`;
    document.getElementById('currentEquity').textContent = `• Equity: ${formatNumber(stats ? stats.equity : 0)} Gold Coins`;
    document.getElementById('realizedProfit').textContent = `• Profit Terealisasi: ${formatNumber(stats ? stats.realizedProfit : 0)} Gold Coins`;
}

// Edit transaction
function editTransaction(transactionId) {
    const transactions = dataManager.getTransactions(currentAccountId);
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    editingTransactionId = transactionId;
    document.getElementById('editTransactionId').value = transactionId;
    document.getElementById('editTransactionDate').value = transaction.date;
    document.getElementById('editTransactionAction').value = transaction.action;
    document.getElementById('editTransactionItemName').value = transaction.itemName;
    document.getElementById('editTransactionTier').value = transaction.tier;
    document.getElementById('editTransactionQuantity').value = transaction.quantity;
    document.getElementById('editTransactionTotalPrice').value = transaction.totalPrice;
    document.getElementById('editTransactionNotes').value = transaction.notes || '';

    document.getElementById('editTransactionModal').classList.add('show');
}

function closeEditTransactionModal() {
    document.getElementById('editTransactionModal').classList.remove('show');
    editingTransactionId = null;
}

function saveTransactionEdit(event) {
    event.preventDefault();
    
    const transactionId = parseInt(document.getElementById('editTransactionId').value);
    const transaction = {
        date: document.getElementById('editTransactionDate').value,
        action: document.getElementById('editTransactionAction').value,
        itemName: document.getElementById('editTransactionItemName').value,
        tier: document.getElementById('editTransactionTier').value,
        quantity: parseInt(document.getElementById('editTransactionQuantity').value),
        totalPrice: parseFloat(document.getElementById('editTransactionTotalPrice').value),
        notes: document.getElementById('editTransactionNotes').value
    };

    dataManager.updateTransaction(currentAccountId, transactionId, transaction);
    closeEditTransactionModal();
    updateTransactionsTable();
    updateSummary();
}

// Delete transaction
function deleteTransaction(transactionId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        dataManager.deleteTransaction(currentAccountId, transactionId);
        updateTransactionsTable();
        updateSummary();
    }
}

// CSV Export
function exportTransactionsCSV() {
    const transactions = dataManager.getTransactions(currentAccountId);
    const exportData = transactions.map(t => ({
        'Date': t.date,
        'Action': t.action,
        'Item Name': t.itemName,
        'Tier': t.tier,
        'Quantity': t.quantity,
        'Total Price': t.totalPrice,
        'Notes': t.notes || ''
    }));

    dataManager.exportToCSV(exportData, 'rucoy-transactions.csv');
}

// CSV Import
function importTransactionsCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    dataManager.importFromCSV(file, function(data) {
        let imported = 0;
        data.forEach(row => {
            try {
                const transaction = {
                    date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
                    action: (row['Action'] || row['action'] || 'BUY').toUpperCase(),
                    itemName: row['Item Name'] || row['itemName'] || row['Item'] || '',
                    tier: row['Tier'] || row['tier'] || 'Common',
                    quantity: parseInt(row['Quantity'] || row['quantity'] || 1),
                    totalPrice: parseFloat(row['Total Price'] || row['totalPrice'] || row['Price'] || 0),
                    notes: row['Notes'] || row['notes'] || ''
                };

                if (transaction.itemName) {
                    dataManager.addTransaction(currentAccountId, transaction);
                    imported++;
                }
            } catch (e) {
                console.error('Error importing row:', e);
            }
        });

        alert(`Imported ${imported} transactions`);
        updateTransactionsTable();
        updateSummary();
        event.target.value = '';
    });
}

// Format helpers
function formatNumber(num) {
    return Math.round(num).toLocaleString('id-ID');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editTransactionModal');
    if (event.target === modal) {
        closeEditTransactionModal();
    }
}
