// Inventory Page Script
let currentAccountId = null;
let allInventoryItems = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    currentAccountId = parseInt(sessionStorage.getItem('currentAccountId'));
    if (!currentAccountId) {
        alert('No account selected. Redirecting to portfolio...');
        window.location.href = 'index.html';
        return;
    }

    updateInventory();
});

// Update inventory display
function updateInventory() {
    allInventoryItems = dataManager.getInventory(currentAccountId);
    filterInventory();
}

// Filter inventory
function filterInventory() {
    const searchTerm = document.getElementById('inventorySearch').value.toLowerCase();
    const filteredItems = allInventoryItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.tier.toLowerCase().includes(searchTerm)
    );

    displayInventory(filteredItems);
}

// Display inventory items
function displayInventory(items) {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';

    if (items.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" style="text-align: center; padding: 2rem;">No items in inventory</td>';
        tableBody.appendChild(row);
        document.getElementById('totalItems').textContent = 'Total Barang: 0';
        document.getElementById('totalValue').textContent = 'Total Value: 0 Gold Coins';
        return;
    }

    let totalValue = 0;

    items.forEach(item => {
        const row = document.createElement('tr');
        const itemValue = item.averageValue * item.quantity;
        totalValue += itemValue;

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.tier}</td>
            <td>${item.quantity}</td>
            <td>${formatNumber(item.averageValue)}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('totalItems').textContent = `Total Barang: ${items.length}`;
    document.getElementById('totalValue').textContent = `Total Value: ${formatNumber(totalValue)} Gold Coins`;
}

// CSV Export
function exportInventoryCSV() {
    const inventory = dataManager.getInventory(currentAccountId);
    const exportData = inventory.map(item => ({
        'Item Name': item.name,
        'Tier': item.tier,
        'Quantity': item.quantity,
        'Average Value': item.averageValue,
        'Total Value': item.averageValue * item.quantity
    }));

    dataManager.exportToCSV(exportData, 'rucoy-inventory.csv');
}

// Format number
function formatNumber(num) {
    return Math.round(num).toLocaleString('id-ID');
}
