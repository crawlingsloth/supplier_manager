// Shop Order Management System
// LocalStorage Manager
const Storage = {
    KEYS: {
        CURRENT_SESSION: 'currentSession',
        ITEM_FREQUENCY: 'itemFrequency',
        VENDORS: 'vendors',
        SAVED_SESSIONS: 'savedSessions',
        SUPPLIERS: 'suppliers',
        ITEM_MAPPINGS: 'itemMappings'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            showToast('Storage limit reached!', 'error');
            return false;
        }
    },

    getCurrentSession() {
        return this.get(this.KEYS.CURRENT_SESSION) || {};
    },

    setCurrentSession(session) {
        return this.set(this.KEYS.CURRENT_SESSION, session);
    },

    getItemFrequency() {
        return this.get(this.KEYS.ITEM_FREQUENCY) || {};
    },

    setItemFrequency(frequency) {
        return this.set(this.KEYS.ITEM_FREQUENCY, frequency);
    },

    getVendors() {
        return this.get(this.KEYS.VENDORS) || [];
    },

    setVendors(vendors) {
        return this.set(this.KEYS.VENDORS, vendors);
    },

    getSavedSessions() {
        return this.get(this.KEYS.SAVED_SESSIONS) || [];
    },

    setSavedSessions(sessions) {
        return this.set(this.KEYS.SAVED_SESSIONS, sessions);
    },

    getSuppliers() {
        return this.get(this.KEYS.SUPPLIERS) || [];
    },

    setSuppliers(suppliers) {
        return this.set(this.KEYS.SUPPLIERS, suppliers);
    },

    getItemMappings() {
        return this.get(this.KEYS.ITEM_MAPPINGS) || {};
    },

    setItemMappings(mappings) {
        return this.set(this.KEYS.ITEM_MAPPINGS, mappings);
    }
};

// State Management
let currentSession = Storage.getCurrentSession();
let itemFrequency = Storage.getItemFrequency();
let vendors = Storage.getVendors();

// DOM Elements
const itemForm = document.getElementById('itemForm');
const itemNameInput = document.getElementById('itemName');
const vendorSelect = document.getElementById('vendorSelect');
const quantityInput = document.getElementById('quantity');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const addItemBtn = document.getElementById('addItemBtn');
const vendorCardsContainer = document.getElementById('vendorCardsContainer');
const frequentItemsGrid = document.getElementById('frequentItemsGrid');
const searchInput = document.getElementById('searchInput');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const loadSessionBtn = document.getElementById('loadSessionBtn');
const newSessionBtn = document.getElementById('newSessionBtn');
const loadSessionModal = document.getElementById('loadSessionModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const confirmDialog = document.getElementById('confirmDialog');

// Initialize App
function init() {
    setupEventListeners();
    renderVendorCards();
    renderFrequentItems();
    updateVendorSuggestions();
    updateItemSuggestions();
    itemNameInput.focus();
    checkLocalStorageAvailability();
}

function checkLocalStorageAvailability() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        showToast('localStorage is not available. Data will not be saved.', 'error');
    }
}

// Event Listeners
function setupEventListeners() {
    // Form submission
    itemForm.addEventListener('submit', handleAddItem);

    // Quantity controls
    incrementBtn.addEventListener('click', () => {
        quantityInput.value = parseInt(quantityInput.value) + 1;
    });

    decrementBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    // Search
    searchInput.addEventListener('input', handleSearch);

    // Top bar actions
    saveSessionBtn.addEventListener('click', handleSaveSession);
    loadSessionBtn.addEventListener('click', showLoadSessionModal);
    newSessionBtn.addEventListener('click', handleNewSession);

    // Modal controls
    closeModalBtn.addEventListener('click', hideLoadSessionModal);
    loadSessionModal.addEventListener('click', (e) => {
        if (e.target === loadSessionModal) {
            hideLoadSessionModal();
        }
    });

    confirmDialog.addEventListener('click', (e) => {
        if (e.target === confirmDialog) {
            hideConfirmDialog();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+S to save session
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            handleSaveSession();
        }
        // Escape to clear form
        if (e.key === 'Escape') {
            if (loadSessionModal.classList.contains('show')) {
                hideLoadSessionModal();
            } else if (confirmDialog.classList.contains('show')) {
                hideConfirmDialog();
            } else {
                clearForm();
            }
        }
    });

    // Auto-suggest vendor when item is selected
    itemNameInput.addEventListener('input', () => {
        const itemName = itemNameInput.value.trim();
        if (itemName && itemFrequency[itemName]) {
            vendorSelect.value = itemFrequency[itemName].lastVendor || '';
        }
    });

    // Update item suggestions
    itemNameInput.addEventListener('focus', updateItemSuggestions);
}

// Add Item
function handleAddItem(e) {
    e.preventDefault();

    const itemName = itemNameInput.value.trim();
    const vendor = vendorSelect.value.trim();
    const quantity = parseInt(quantityInput.value);

    // Validation
    if (!itemName || !vendor || quantity <= 0) {
        showToast('Please fill in all fields correctly', 'error');
        return;
    }

    // Initialize vendor if not exists
    if (!currentSession[vendor]) {
        currentSession[vendor] = [];
    }

    // Check if item already exists for this vendor
    const existingItemIndex = currentSession[vendor].findIndex(
        item => item.item.toLowerCase() === itemName.toLowerCase()
    );

    if (existingItemIndex !== -1) {
        // Update quantity
        currentSession[vendor][existingItemIndex].qty = quantity;
        showToast(`Updated ${itemName} quantity to ${quantity}`, 'success');
    } else {
        // Add new item
        currentSession[vendor].push({
            item: itemName,
            qty: quantity,
            addedAt: Date.now()
        });
        showToast(`Added ${itemName} to ${vendor}`, 'success');
    }

    // Update frequency tracking
    updateItemFrequency(itemName, vendor);

    // Add vendor to list if not exists
    if (!vendors.includes(vendor)) {
        vendors.push(vendor);
        Storage.setVendors(vendors);
    }

    // Save and render
    Storage.setCurrentSession(currentSession);
    renderVendorCards();
    renderFrequentItems();
    updateVendorSuggestions();

    // Reset form
    clearForm();
    itemNameInput.focus();
}

function updateItemFrequency(itemName, vendor) {
    if (!itemFrequency[itemName]) {
        itemFrequency[itemName] = {
            count: 0,
            lastVendor: vendor,
            lastUsed: Date.now()
        };
    }

    itemFrequency[itemName].count++;
    itemFrequency[itemName].lastVendor = vendor;
    itemFrequency[itemName].lastUsed = Date.now();

    Storage.setItemFrequency(itemFrequency);
}

// Render Functions
function renderVendorCards(searchTerm = '') {
    const vendorNames = Object.keys(currentSession).filter(vendor => {
        if (!searchTerm) return true;

        const items = currentSession[vendor];
        return items.some(item =>
            item.item.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (vendorNames.length === 0) {
        vendorCardsContainer.innerHTML = '<p class="empty-message">Add your first item to get started</p>';
        return;
    }

    vendorCardsContainer.innerHTML = vendorNames.map(vendor => {
        const items = currentSession[vendor].filter(item => {
            if (!searchTerm) return true;
            return item.item.toLowerCase().includes(searchTerm.toLowerCase());
        });

        if (items.length === 0) return '';

        return `
            <div class="vendor-card" data-vendor="${vendor}">
                <div class="vendor-card-header">
                    <span>${vendor}</span>
                    <span class="item-count-badge">${items.length} items</span>
                </div>
                <div class="vendor-items">
                    ${items.map(item => `
                        <div class="vendor-item">
                            <span class="item-name">${item.item}</span>
                            <span class="item-qty">${item.qty}</span>
                            <button class="delete-item-btn" onclick="deleteItem('${vendor}', '${item.item}')" title="Delete item">
                                ✕
                            </button>
                        </div>
                    `).join('')}
                </div>
                <div class="vendor-card-actions">
                    <button class="btn btn-secondary btn-small" onclick="copyVendorList('${vendor}')">
                        Copy List
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="exportVendorCSV('${vendor}')">
                        Export CSV
                    </button>
                    <button class="btn btn-danger btn-small" onclick="clearVendor('${vendor}')">
                        Clear All
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderFrequentItems() {
    // Get items sorted by frequency from last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const frequentItems = Object.entries(itemFrequency)
        .filter(([_, data]) => data.lastUsed > thirtyDaysAgo)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8);

    if (frequentItems.length === 0) {
        frequentItemsGrid.innerHTML = '<p class="empty-message">Add items to see frequent picks</p>';
        return;
    }

    frequentItemsGrid.innerHTML = frequentItems.map(([itemName, data]) => `
        <button class="frequent-item-btn" onclick="quickAddItem('${itemName}', '${data.lastVendor}')">
            ${itemName}<br><small>(${data.lastVendor})</small>
        </button>
    `).join('');
}

function updateItemSuggestions() {
    const datalist = document.getElementById('itemSuggestions');

    // Combine items from frequency tracking and mappings
    const frequencyItems = Object.keys(itemFrequency);
    const mappedItems = Object.keys(itemMappings);

    // Merge and deduplicate
    const allItems = [...new Set([...frequencyItems, ...mappedItems])].sort();

    datalist.innerHTML = allItems.map(item =>
        `<option value="${item}">`
    ).join('');
}

function updateVendorSuggestions() {
    const datalist = document.getElementById('vendorSuggestions');
    datalist.innerHTML = vendors.map(vendor =>
        `<option value="${vendor}">`
    ).join('');
}

// Quick Add from Frequent Items
function quickAddItem(itemName, vendor) {
    itemNameInput.value = itemName;
    vendorSelect.value = vendor;
    quantityInput.value = 1;
    itemNameInput.focus();
}

// Delete Item
function deleteItem(vendor, itemName) {
    const items = currentSession[vendor];
    const itemIndex = items.findIndex(item => item.item === itemName);

    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);

        // Remove vendor if no items left
        if (items.length === 0) {
            delete currentSession[vendor];
        }

        Storage.setCurrentSession(currentSession);

        // Flash animation
        const vendorCard = document.querySelector(`[data-vendor="${vendor}"]`);
        if (vendorCard) {
            vendorCard.classList.add('flash-red');
            setTimeout(() => vendorCard.classList.remove('flash-red'), 600);
        }

        renderVendorCards();
        showToast(`Deleted ${itemName}`, 'success');
    }
}

// Clear Vendor
function clearVendor(vendor) {
    showConfirmDialog(
        'Clear All Items',
        `Are you sure you want to clear all items for ${vendor}?`,
        () => {
            delete currentSession[vendor];
            Storage.setCurrentSession(currentSession);
            renderVendorCards();
            showToast(`Cleared all items for ${vendor}`, 'success');
        }
    );
}

// Copy Vendor List
function copyVendorList(vendor) {
    const items = currentSession[vendor];
    const text = items.map(item => `${item.item} - ${item.qty}`).join('\n');

    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    }).catch(err => {
        showToast('Failed to copy', 'error');
        console.error('Copy failed:', err);
    });
}

// Export CSV
function exportVendorCSV(vendor) {
    const items = currentSession[vendor];
    const csvContent = 'Item,Quantity\n' + items.map(item =>
        `"${item.item}",${item.qty}`
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `${vendor}_${date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('CSV exported!', 'success');
}

// Search
function handleSearch(e) {
    const searchTerm = e.target.value.trim();
    renderVendorCards(searchTerm);
}

// Session Management
function handleSaveSession() {
    if (Object.keys(currentSession).length === 0) {
        showToast('No items to save', 'error');
        return;
    }

    const sessionName = prompt('Enter a name for this session (optional):') || 'Untitled Session';
    const savedSessions = Storage.getSavedSessions();

    savedSessions.push({
        date: new Date().toISOString(),
        name: sessionName,
        data: JSON.parse(JSON.stringify(currentSession))
    });

    Storage.setSavedSessions(savedSessions);
    showToast('Session saved!', 'success');
}

function showLoadSessionModal() {
    const savedSessions = Storage.getSavedSessions();
    const sessionsList = document.getElementById('sessionsList');

    if (savedSessions.length === 0) {
        sessionsList.innerHTML = '<p class="empty-message">No saved sessions found</p>';
    } else {
        sessionsList.innerHTML = savedSessions.map((session, index) => {
            const date = new Date(session.date).toLocaleString();
            return `
                <div class="session-item" onclick="loadSession(${index})">
                    <div class="session-date">${date}</div>
                    <div class="session-name">${session.name}</div>
                </div>
            `;
        }).reverse().join('');
    }

    loadSessionModal.classList.add('show');
}

function hideLoadSessionModal() {
    loadSessionModal.classList.remove('show');
}

function loadSession(index) {
    const savedSessions = Storage.getSavedSessions();
    currentSession = JSON.parse(JSON.stringify(savedSessions[index].data));
    Storage.setCurrentSession(currentSession);
    renderVendorCards();
    hideLoadSessionModal();
    showToast('Session loaded!', 'success');
}

function handleNewSession() {
    if (Object.keys(currentSession).length === 0) {
        return;
    }

    showConfirmDialog(
        'New Session',
        'Are you sure you want to start a new session? Current items will be cleared.',
        () => {
            currentSession = {};
            Storage.setCurrentSession(currentSession);
            renderVendorCards();
            clearForm();
            showToast('Started new session', 'success');
        }
    );
}

// Utility Functions
function clearForm() {
    itemNameInput.value = '';
    vendorSelect.value = '';
    quantityInput.value = 1;
}

function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function showConfirmDialog(title, message, onConfirm) {
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');

    confirmTitle.textContent = title;
    confirmMessage.textContent = message;

    confirmDialog.classList.add('show');

    const handleConfirm = () => {
        onConfirm();
        hideConfirmDialog();
        cleanup();
    };

    const handleCancel = () => {
        hideConfirmDialog();
        cleanup();
    };

    const cleanup = () => {
        confirmOkBtn.removeEventListener('click', handleConfirm);
        confirmCancelBtn.removeEventListener('click', handleCancel);
    };

    confirmOkBtn.addEventListener('click', handleConfirm);
    confirmCancelBtn.addEventListener('click', handleCancel);
}

function hideConfirmDialog() {
    confirmDialog.classList.remove('show');
}

// ============================================
// ITEM MAPPING TAB FUNCTIONALITY
// ============================================

// Mapping State
let suppliers = Storage.getSuppliers();
let itemMappings = Storage.getItemMappings();
let itemsToMap = [];
let currentItemIndex = 0;
let uploadedFileName = '';

// Tab Switching
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });

    // Initialize mapping tab if switched to it
    if (tabName === 'mapping') {
        initMappingTab();
    }

    // Refresh autocomplete when switching to orders tab
    if (tabName === 'orders') {
        itemMappings = Storage.getItemMappings();
        updateItemSuggestions();
        updateVendorSuggestions();
    }
}

// Initialize Mapping Tab
function initMappingTab() {
    suppliers = Storage.getSuppliers();
    itemMappings = Storage.getItemMappings();
    renderSuppliersList();
    setupMappingEventListeners();
}

// Supplier Management
function setupMappingEventListeners() {
    const addSupplierBtn = document.getElementById('addSupplierBtn');
    const newSupplierInput = document.getElementById('newSupplierInput');
    const proceedToUploadBtn = document.getElementById('proceedToUploadBtn');
    const backToSuppliersBtn = document.getElementById('backToSuppliersBtn');
    const csvFileInput = document.getElementById('csvFileInput');
    const startMappingBtn = document.getElementById('startMappingBtn');
    const skipItemBtn = document.getElementById('skipItemBtn');
    const restartMappingBtn = document.getElementById('restartMappingBtn');
    const finishMappingBtn = document.getElementById('finishMappingBtn');
    const downloadMappingBtn = document.getElementById('downloadMappingBtn');
    const remapItemsBtn = document.getElementById('remapItemsBtn');
    const goToOrdersBtn = document.getElementById('goToOrdersBtn');

    // Remove existing listeners
    if (addSupplierBtn) {
        addSupplierBtn.replaceWith(addSupplierBtn.cloneNode(true));
        document.getElementById('addSupplierBtn').addEventListener('click', handleAddSupplier);
    }

    if (newSupplierInput) {
        newSupplierInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSupplier();
            }
        });
    }

    if (proceedToUploadBtn) {
        proceedToUploadBtn.replaceWith(proceedToUploadBtn.cloneNode(true));
        document.getElementById('proceedToUploadBtn').addEventListener('click', showUploadSection);
    }

    if (backToSuppliersBtn) {
        backToSuppliersBtn.replaceWith(backToSuppliersBtn.cloneNode(true));
        document.getElementById('backToSuppliersBtn').addEventListener('click', showSupplierSection);
    }

    if (csvFileInput) {
        csvFileInput.replaceWith(csvFileInput.cloneNode(true));
        document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);
    }

    if (startMappingBtn) {
        startMappingBtn.replaceWith(startMappingBtn.cloneNode(true));
        document.getElementById('startMappingBtn').addEventListener('click', startItemMapping);
    }

    if (skipItemBtn) {
        skipItemBtn.replaceWith(skipItemBtn.cloneNode(true));
        document.getElementById('skipItemBtn').addEventListener('click', skipCurrentItem);
    }

    if (restartMappingBtn) {
        restartMappingBtn.replaceWith(restartMappingBtn.cloneNode(true));
        document.getElementById('restartMappingBtn').addEventListener('click', restartMapping);
    }

    if (finishMappingBtn) {
        finishMappingBtn.replaceWith(finishMappingBtn.cloneNode(true));
        document.getElementById('finishMappingBtn').addEventListener('click', finishMapping);
    }

    if (downloadMappingBtn) {
        downloadMappingBtn.replaceWith(downloadMappingBtn.cloneNode(true));
        document.getElementById('downloadMappingBtn').addEventListener('click', downloadMappedItems);
    }

    if (remapItemsBtn) {
        remapItemsBtn.replaceWith(remapItemsBtn.cloneNode(true));
        document.getElementById('remapItemsBtn').addEventListener('click', () => {
            showSupplierSection();
            document.getElementById('completionSection').style.display = 'none';
        });
    }

    if (goToOrdersBtn) {
        goToOrdersBtn.replaceWith(goToOrdersBtn.cloneNode(true));
        document.getElementById('goToOrdersBtn').addEventListener('click', () => switchTab('orders'));
    }
}

function handleAddSupplier() {
    const input = document.getElementById('newSupplierInput');
    const supplierName = input.value.trim();

    if (!supplierName) {
        showToast('Please enter a supplier name', 'error');
        return;
    }

    if (suppliers.includes(supplierName)) {
        showToast('Supplier already exists', 'error');
        return;
    }

    suppliers.push(supplierName);
    Storage.setSuppliers(suppliers);
    renderSuppliersList();
    input.value = '';
    input.focus();
    showToast('Supplier added!', 'success');
}

function renderSuppliersList() {
    const suppliersList = document.getElementById('suppliersList');
    const proceedBtn = document.getElementById('proceedToUploadBtn');

    if (suppliers.length === 0) {
        suppliersList.innerHTML = '<p class="empty-message">No suppliers added yet. Add your first supplier to begin.</p>';
        proceedBtn.style.display = 'none';
    } else {
        suppliersList.innerHTML = suppliers.map(supplier => `
            <div class="supplier-item">
                <span class="supplier-name">${supplier}</span>
                <button class="delete-supplier-btn" onclick="deleteSupplier('${supplier}')" title="Delete supplier">
                    ✕
                </button>
            </div>
        `).join('');
        proceedBtn.style.display = 'block';
    }
}

function deleteSupplier(supplierName) {
    showConfirmDialog(
        'Delete Supplier',
        `Are you sure you want to delete ${supplierName}?`,
        () => {
            suppliers = suppliers.filter(s => s !== supplierName);
            Storage.setSuppliers(suppliers);
            renderSuppliersList();
            showToast('Supplier deleted', 'success');
        }
    );
}

// Section Navigation
function showUploadSection() {
    document.getElementById('supplierManagement').style.display = 'none';
    document.getElementById('csvUploadSection').style.display = 'block';
}

function showSupplierSection() {
    document.getElementById('supplierManagement').style.display = 'block';
    document.getElementById('csvUploadSection').style.display = 'none';
    document.getElementById('itemMappingSection').style.display = 'none';
}

// CSV Upload and Parsing
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFileName = file.name;
    document.getElementById('fileNameDisplay').textContent = `Selected: ${file.name}`;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    reader.readAsText(file);
}

function parseCSV(text) {
    const lines = text.split('\n').filter(line => line.trim());
    itemsToMap = [];
    let hasSupplierColumn = false;
    let importedMappings = {};

    // Check first line to see if it has supplier column
    if (lines.length > 0) {
        const firstLine = lines[0].split('\t').length > 1
            ? lines[0].split('\t')
            : lines[0].split(',');

        const columns = firstLine.map(col => col.trim().replace(/^"|"$/g, ''));

        // Check if we have 2+ columns (Item and Supplier)
        if (columns.length >= 2) {
            hasSupplierColumn = true;
        }
    }

    lines.forEach((line, index) => {
        // Handle both tab and comma separated
        const separator = line.includes('\t') ? '\t' : ',';
        const columns = line.split(separator).map(col => col.trim().replace(/^"|"$/g, ''));

        // Skip header row if it looks like a header
        if (index === 0 && (line.toLowerCase().includes('item') || line.toLowerCase().includes('supplier'))) {
            return;
        }

        const itemName = columns[0];

        if (!itemName) return;

        if (hasSupplierColumn && columns.length >= 2) {
            const supplierName = columns[1];
            if (supplierName) {
                // Direct import mode - save mapping immediately
                importedMappings[itemName] = supplierName;

                // Add supplier to suppliers list if not exists
                if (!suppliers.includes(supplierName)) {
                    suppliers.push(supplierName);
                }
            }
        } else {
            // Manual mapping mode
            itemsToMap.push(itemName);
        }
    });

    // If we imported direct mappings, save and show completion
    if (Object.keys(importedMappings).length > 0) {
        // Merge with existing mappings
        itemMappings = { ...itemMappings, ...importedMappings };
        Storage.setItemMappings(itemMappings);
        Storage.setSuppliers(suppliers);

        // Show completion directly
        document.getElementById('csvUploadSection').style.display = 'none';
        document.getElementById('completionSection').style.display = 'block';
        document.getElementById('completionStats').textContent =
            `Successfully imported ${Object.keys(importedMappings).length} item-supplier mappings!`;

        showToast(`Imported ${Object.keys(importedMappings).length} mappings!`, 'success');

        // Update autocomplete in orders tab
        updateItemSuggestions();
        return;
    }

    // Manual mapping mode
    if (itemsToMap.length === 0) {
        showToast('No items found in CSV', 'error');
        return;
    }

    document.getElementById('startMappingBtn').style.display = 'block';
    showToast(`${itemsToMap.length} items loaded for manual mapping!`, 'success');
}

function startItemMapping() {
    if (itemsToMap.length === 0) {
        showToast('Please upload a CSV file first', 'error');
        return;
    }

    currentItemIndex = 0;
    document.getElementById('csvUploadSection').style.display = 'none';
    document.getElementById('itemMappingSection').style.display = 'block';
    renderSupplierButtons();
    showCurrentItem();
}

function renderSupplierButtons() {
    const container = document.getElementById('supplierButtons');
    container.innerHTML = suppliers.map(supplier => `
        <button class="supplier-assign-btn" onclick="assignItemToSupplier('${supplier}')">
            ${supplier}
        </button>
    `).join('');
}

function showCurrentItem() {
    if (currentItemIndex >= itemsToMap.length) {
        finishMapping();
        return;
    }

    const currentItem = itemsToMap[currentItemIndex];
    document.getElementById('currentItemName').textContent = currentItem;
    document.getElementById('progressText').textContent = `Item ${currentItemIndex + 1} of ${itemsToMap.length}`;

    const progress = ((currentItemIndex) / itemsToMap.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;

    // Show finish button if on last item
    if (currentItemIndex === itemsToMap.length - 1) {
        document.getElementById('finishMappingBtn').style.display = 'block';
    }
}

function assignItemToSupplier(supplierName) {
    const currentItem = itemsToMap[currentItemIndex];
    itemMappings[currentItem] = supplierName;
    Storage.setItemMappings(itemMappings);

    showToast(`Assigned to ${supplierName}`, 'success');
    currentItemIndex++;
    showCurrentItem();
}

function skipCurrentItem() {
    currentItemIndex++;
    showCurrentItem();
}

function restartMapping() {
    showConfirmDialog(
        'Restart Mapping',
        'Are you sure you want to restart? Your current progress will be saved.',
        () => {
            currentItemIndex = 0;
            showCurrentItem();
            document.getElementById('finishMappingBtn').style.display = 'none';
        }
    );
}

function finishMapping() {
    const mappedCount = Object.keys(itemMappings).length;
    const totalCount = itemsToMap.length;

    document.getElementById('itemMappingSection').style.display = 'none';
    document.getElementById('completionSection').style.display = 'block';
    document.getElementById('completionStats').textContent =
        `You mapped ${mappedCount} out of ${totalCount} items to suppliers.`;

    showToast('Mapping complete!', 'success');
}

function downloadMappedItems() {
    const mappings = Storage.getItemMappings();
    if (Object.keys(mappings).length === 0) {
        showToast('No mapped items to download', 'error');
        return;
    }

    let csvContent = 'Item,Supplier\n';
    for (const [item, supplier] of Object.entries(mappings)) {
        csvContent += `"${item}","${supplier}"\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `item_mappings_${date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast('Downloaded!', 'success');
}

// Update vendor selector with mapped suppliers
function updateVendorFromMapping() {
    const itemName = itemNameInput.value.trim();
    if (itemName && itemMappings[itemName]) {
        vendorSelect.value = itemMappings[itemName];
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupTabNavigation();
    initMappingTab();

    // Update vendor selection when item name changes (check mappings)
    if (itemNameInput) {
        itemNameInput.addEventListener('input', updateVendorFromMapping);
    }
});

// Service Worker for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, app will still work online
        });
    });
}
