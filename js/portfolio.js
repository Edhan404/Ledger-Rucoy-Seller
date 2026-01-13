// Portfolio Page Script
let deleteAccountId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    updatePortfolio();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
});

// Update portfolio display
function updatePortfolio() {
    const accounts = dataManager.getAccounts();
    const accountsTableBody = document.getElementById('accountsTableBody');
    
    accountsTableBody.innerHTML = '';

    let totalIAmount = 0;
    let totalGAmount = 0;
    let totalDAmount = 0;
    let netAssetValue = 0;

    accounts.forEach(account => {
        const stats = dataManager.calculateAccountStats(account.id);
        if (!stats) return;

        totalIAmount += stats.iAmount;
        totalGAmount += stats.gAmount;
        totalDAmount += stats.dAmount;
        netAssetValue += stats.totalValue;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${account.name}</strong>
                ${account.label ? `<br><small>${account.label}</small>` : ''}
            </td>
            <td class="amount-blue">${formatNumber(stats.iAmount)}</td>
            <td class="amount-green">${formatNumber(stats.gAmount)}</td>
            <td class="amount-orange">${formatNumber(stats.dAmount)}</td>
            <td><strong>${formatNumber(stats.totalValue)}</strong></td>
            <td>
                <button class="btn btn-primary" onclick="viewInventory(${account.id})" style="padding: 0.4rem 0.8rem; margin-right: 0.25rem;">View Inventory</button>
                <button class="btn btn-primary" onclick="viewTransactions(${account.id})" style="padding: 0.4rem 0.8rem; margin-right: 0.25rem;">Add/Edit Transaksi</button>
                <button class="btn btn-secondary" onclick="editAccount(${account.id})" style="padding: 0.4rem 0.8rem; margin-right: 0.25rem;">Edit</button>
                <button class="btn btn-danger" onclick="showDeleteConfirm(${account.id})" style="padding: 0.4rem 0.8rem;">Delete</button>
            </td>
        `;
        accountsTableBody.appendChild(row);
    });

    // Update summary cards
    document.getElementById('netAssetValue').textContent = formatNumber(netAssetValue) + ' Gold Coins';
    document.getElementById('totalIAmount').textContent = formatNumber(totalIAmount);
    document.getElementById('totalGAmount').textContent = formatNumber(totalGAmount);
    document.getElementById('totalDAmount').textContent = formatNumber(totalDAmount);
}

// Format number with commas
function formatNumber(num) {
    return Math.round(num).toLocaleString('id-ID');
}

// Account Management
function showAddAccountModal() {
    document.getElementById('addAccountModal').classList.add('show');
    document.getElementById('accountName').value = '';
    document.getElementById('accountLabel').value = '';
    document.getElementById('initialEquity').value = '0';
}

function closeAddAccountModal() {
    document.getElementById('addAccountModal').classList.remove('show');
}

function addAccount(event) {
    event.preventDefault();
    const name = document.getElementById('accountName').value;
    const label = document.getElementById('accountLabel').value;
    const initialEquity = parseFloat(document.getElementById('initialEquity').value) || 0;

    dataManager.addAccount({
        name: name,
        label: label,
        initialEquity: initialEquity
    });

    closeAddAccountModal();
    updatePortfolio();
}

function editAccount(accountId) {
    const account = dataManager.getAccount(accountId);
    if (!account) return;

    document.getElementById('editAccountId').value = accountId;
    document.getElementById('editAccountName').value = account.name;
    document.getElementById('editAccountLabel').value = account.label || '';
    document.getElementById('editAccountModal').classList.add('show');
}

function closeEditAccountModal() {
    document.getElementById('editAccountModal').classList.remove('show');
}

function saveAccountEdit(event) {
    event.preventDefault();
    const accountId = parseInt(document.getElementById('editAccountId').value);
    const name = document.getElementById('editAccountName').value;
    const label = document.getElementById('editAccountLabel').value;

    dataManager.updateAccount(accountId, {
        name: name,
        label: label
    });

    closeEditAccountModal();
    updatePortfolio();
}

function showDeleteConfirm(accountId) {
    deleteAccountId = accountId;
    document.getElementById('deleteConfirmModal').classList.add('show');
}

function closeDeleteConfirmModal() {
    deleteAccountId = null;
    document.getElementById('deleteConfirmModal').classList.remove('show');
}

function confirmDeleteAccount() {
    if (deleteAccountId) {
        dataManager.deleteAccount(deleteAccountId);
        deleteAccountId = null;
        closeDeleteConfirmModal();
        updatePortfolio();
    }
}

// Navigation
function viewInventory(accountId) {
    sessionStorage.setItem('currentAccountId', accountId);
    window.location.href = 'inventory.html';
}

function viewTransactions(accountId) {
    sessionStorage.setItem('currentAccountId', accountId);
    window.location.href = 'add-transaction.html';
}

// CSV Export
function exportPortfolioCSV() {
    const accounts = dataManager.getAccounts();
    const exportData = accounts.map(account => {
        const stats = dataManager.calculateAccountStats(account.id);
        return {
            'Account Name': account.name,
            'Label': account.label || '',
            'I Amount': stats ? stats.iAmount : 0,
            'G Amount': stats ? stats.gAmount : 0,
            'D Amount': stats ? stats.dAmount : 0,
            'Total Value': stats ? stats.totalValue : 0
        };
    });

    dataManager.exportToCSV(exportData, 'rucoy-portfolio.csv');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}
