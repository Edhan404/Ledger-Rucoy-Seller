// Data Manager - Centralized data storage and management
class DataManager {
    constructor() {
        this.storageKey = 'rucoyLedgerData';
        this.init();
    }

    init() {
        if (!this.getData()) {
            this.saveData({
                accounts: [],
                transactions: {},
                lastAccountId: 0,
                lastTransactionId: 0
            });
        }
    }

    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Account Management
    getAccounts() {
        const data = this.getData();
        return data ? data.accounts : [];
    }

    addAccount(account) {
        const data = this.getData();
        const newAccount = {
            id: ++data.lastAccountId,
            name: account.name,
            label: account.label || '',
            initialEquity: account.initialEquity || 0,
            createdAt: new Date().toISOString()
        };
        data.accounts.push(newAccount);
        if (!data.transactions[newAccount.id]) {
            data.transactions[newAccount.id] = [];
        }
        this.saveData(data);
        return newAccount;
    }

    updateAccount(accountId, updates) {
        const data = this.getData();
        const account = data.accounts.find(a => a.id === accountId);
        if (account) {
            Object.assign(account, updates);
            this.saveData(data);
            return account;
        }
        return null;
    }

    deleteAccount(accountId) {
        const data = this.getData();
        data.accounts = data.accounts.filter(a => a.id !== accountId);
        delete data.transactions[accountId];
        this.saveData(data);
    }

    getAccount(accountId) {
        const data = this.getData();
        return data.accounts.find(a => a.id === accountId);
    }

    // Transaction Management
    getTransactions(accountId) {
        const data = this.getData();
        return data.transactions[accountId] || [];
    }

    addTransaction(accountId, transaction) {
        const data = this.getData();
        if (!data.transactions[accountId]) {
            data.transactions[accountId] = [];
        }
        const newTransaction = {
            id: ++data.lastTransactionId,
            accountId: accountId,
            date: transaction.date,
            action: transaction.action,
            itemName: transaction.itemName,
            tier: transaction.tier,
            quantity: transaction.quantity,
            totalPrice: transaction.totalPrice,
            notes: transaction.notes || '',
            createdAt: new Date().toISOString()
        };
        data.transactions[accountId].push(newTransaction);
        this.saveData(data);
        return newTransaction;
    }

    updateTransaction(accountId, transactionId, updates) {
        const data = this.getData();
        const transactions = data.transactions[accountId] || [];
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction) {
            Object.assign(transaction, updates);
            this.saveData(data);
            return transaction;
        }
        return null;
    }

    deleteTransaction(accountId, transactionId) {
        const data = this.getData();
        const transactions = data.transactions[accountId] || [];
        data.transactions[accountId] = transactions.filter(t => t.id !== transactionId);
        this.saveData(data);
    }

    // Calculations
    calculateAccountStats(accountId) {
        const account = this.getAccount(accountId);
        if (!account) return null;

        const transactions = this.getTransactions(accountId);
        let equity = account.initialEquity || 0;
        let iAmount = 0; // Item value (excluding Diamonds)
        let dAmount = 0; // Diamond value
        let realizedProfit = 0;

        // Track inventory for FIFO calculation
        const inventory = {};

        // Process transactions chronologically
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        sortedTransactions.forEach(transaction => {
            const itemName = transaction.itemName;
            const isDiamond = itemName.toLowerCase() === "diamond's" || 
                            itemName.toLowerCase() === "diamonds";

            if (transaction.action === 'BUY') {
                equity -= transaction.totalPrice;
                
                // Track in inventory
                if (!inventory[itemName]) {
                    inventory[itemName] = [];
                }
                inventory[itemName].push({
                    quantity: transaction.quantity,
                    totalPrice: transaction.totalPrice,
                    date: transaction.date
                });

                if (isDiamond) {
                    dAmount += transaction.totalPrice;
                } else {
                    iAmount += transaction.totalPrice;
                }
            } else if (transaction.action === 'SELL') {
                // FIFO: Remove from inventory
                if (!inventory[itemName]) {
                    inventory[itemName] = [];
                }

                let remainingQuantity = transaction.quantity;
                let totalCost = 0;

                // Process FIFO
                for (let i = 0; i < inventory[itemName].length && remainingQuantity > 0; i++) {
                    const buy = inventory[itemName][i];
                    if (buy.quantity <= 0) continue;

                    const usedQuantity = Math.min(remainingQuantity, buy.quantity);
                    const costPerUnit = buy.totalPrice / buy.quantity;
                    totalCost += costPerUnit * usedQuantity;
                    remainingQuantity -= usedQuantity;
                    buy.quantity -= usedQuantity;
                }

                const profit = transaction.totalPrice - totalCost;
                realizedProfit += profit;
                equity += transaction.totalPrice;

                // Reduce item value
                if (isDiamond) {
                    dAmount = Math.max(0, dAmount - totalCost);
                } else {
                    iAmount = Math.max(0, iAmount - totalCost);
                }
            }
        });

        return {
            equity: equity,
            gAmount: equity, // G Amount is the equity (Gold Coins remaining)
            iAmount: Math.max(0, iAmount),
            dAmount: Math.max(0, dAmount),
            totalValue: iAmount + equity + dAmount,
            realizedProfit: realizedProfit
        };
    }

    getInventory(accountId) {
        const transactions = this.getTransactions(accountId);
        const inventory = {};

        // Process transactions chronologically
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );

        sortedTransactions.forEach(transaction => {
            const itemName = transaction.itemName;
            if (!inventory[itemName]) {
                inventory[itemName] = {
                    name: itemName,
                    tier: transaction.tier,
                    quantity: 0,
                    totalCost: 0
                };
            }

            if (transaction.action === 'BUY') {
                inventory[itemName].quantity += transaction.quantity;
                inventory[itemName].totalCost += transaction.totalPrice;
            } else if (transaction.action === 'SELL') {
                // FIFO: Remove from inventory
                const remainingQuantity = Math.min(inventory[itemName].quantity, transaction.quantity);
                if (remainingQuantity > 0) {
                    const avgCost = inventory[itemName].totalCost / inventory[itemName].quantity;
                    inventory[itemName].quantity -= remainingQuantity;
                    inventory[itemName].totalCost -= avgCost * remainingQuantity;
                }
            }
        });

        // Convert to array and calculate average values
        return Object.values(inventory)
            .filter(item => item.quantity > 0)
            .map(item => ({
                name: item.name,
                tier: item.tier,
                quantity: item.quantity,
                averageValue: item.quantity > 0 ? item.totalCost / item.quantity : 0
            }));
    }

    // CSV Export/Import
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importFromCSV(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    data.push(row);
                }
            }

            callback(data);
        };
        reader.readAsText(file);
    }
}

// Global instance
const dataManager = new DataManager();
