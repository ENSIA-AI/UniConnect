const lostItemsContainer = document.getElementById('lost-items-container');
const foundItemsContainer = document.getElementById('found-items-container');
const lostReportForm = document.getElementById('lost-report-form');
const foundReportForm = document.getElementById('found-report-form');
const lostItemForm = document.getElementById('lost-item-form');
const foundItemForm = document.getElementById('found-item-form');
const reportLostBtn = document.getElementById('report-lost-btn');
const reportFoundBtn = document.getElementById('report-found-btn');
const cancelLostFormBtn = document.getElementById('cancel-lost-form');
const cancelFoundFormBtn = document.getElementById('cancel-found-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const successModal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close-modal');
const modalOk = document.getElementById('modal-ok');
const modalMessage = document.getElementById('modal-message');

const currentUser = JSON.parse(localStorage.getItem('currentUser'));

document.addEventListener('DOMContentLoaded', async function() {
    if (!currentUser) {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
        return;
    }
    
    await loadItems();
    setupEventListeners();
});

async function loadItems() {
    try {
        const items = await apiCall(API_ENDPOINTS.LOST_FOUND.GET_ALL);
        
        const lostItems = items.filter(item => item.status === 'lost');
        const foundItems = items.filter(item => item.status === 'found');
        
        displayLostItems(lostItems);
        displayFoundItems(foundItems);
    } catch (error) {
        console.error('Error loading items:', error);
    }
}

function setupEventListeners() {
    reportLostBtn.addEventListener('click', () => showReportForm('lost'));
    reportFoundBtn.addEventListener('click', () => showReportForm('found'));
    cancelLostFormBtn.addEventListener('click', () => hideReportForm('lost'));
    cancelFoundFormBtn.addEventListener('click', () => hideReportForm('found'));

    lostItemForm.addEventListener('submit', handleLostFormSubmit);
    foundItemForm.addEventListener('submit', handleFoundFormSubmit);

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

    closeModal.addEventListener('click', closeSuccessModal);
    modalOk.addEventListener('click', closeSuccessModal);
    window.addEventListener('click', (e) => { if (e.target === successModal) closeSuccessModal(); });
}

function displayLostItems(items) {
    lostItemsContainer.innerHTML = '';
    if (!items.length) {
        lostItemsContainer.innerHTML = `<div class="no-items"><i class="fas fa-search"></i><h3>No lost items found</h3></div>`;
        return;
    }
    items.forEach(item => lostItemsContainer.appendChild(createItemCard(item)));
}

function displayFoundItems(items) {
    foundItemsContainer.innerHTML = '';
    if (!items.length) {
        foundItemsContainer.innerHTML = `<div class="no-items"><i class="fas fa-search"></i><h3>No found items available</h3></div>`;
        return;
    }
    items.forEach(item => foundItemsContainer.appendChild(createItemCard(item)));
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    const icon = getCategoryIcon(item.category);
    const date = formatDate(item.date_lost_found);
    const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
    const storage = item.storage_location ? `<div><i class="fas fa-box"></i> Stored at: ${escapeHtml(item.storage_location)}</div>` : '';

    card.innerHTML = `
        <div class="item-image">${item.image_url ? `<img src="${item.image_url}">` : `<i class="${icon}"></i>`}</div>
        <div class="item-details">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <div class="item-meta">
                <div><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}</div>
                <div><i class="fas fa-calendar-alt"></i> ${date}</div>
                <div><i class="fas fa-envelope"></i> ${escapeHtml(item.contact_email)}</div>
                ${storage}
            </div>
            <div class="item-status ${statusClass}">${item.status === 'lost' ? 'Lost' : 'Found'}</div>
        </div>
    `;
    return card;
}

function getCategoryIcon(cat) {
    return {
        wallet: 'fas fa-wallet',
        phone: 'fas fa-mobile-alt',
        keys: 'fas fa-key',
        book: 'fas fa-book',
        electronics: 'fas fa-laptop',
        clothing: 'fas fa-tshirt',
        other: 'fas fa-question-circle'
    }[cat] || 'fas fa-question-circle';
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function showReportForm(type) {
    if (type === 'lost') {
        lostReportForm.style.display = 'block';
        foundReportForm.style.display = 'none';
        lostReportForm.scrollIntoView({ behavior: 'smooth' });
    } else {
        foundReportForm.style.display = 'block';
        lostReportForm.style.display = 'none';
        foundReportForm.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideReportForm(type) {
    if (type === 'lost') {
        lostReportForm.style.display = 'none';
        resetForm('lost');
    } else {
        foundReportForm.style.display = 'none';
        resetForm('found');
    }
}

function resetForm(type) {
    const form = type === 'lost' ? lostItemForm : foundItemForm;
    form.reset();
    hideAllErrors(type);
}

function hideAllErrors(type) {
    const prefix = type === 'lost' ? '' : 'found-';
    ['title', 'category', 'description', 'location', 'date', 'email'].forEach(id => {
        const errorEl = document.getElementById(`${prefix}${id}-error`);
        if (errorEl) errorEl.style.display = 'none';
    });
    if (type === 'found') {
        const storageError = document.getElementById('storage-error');
        if (storageError) storageError.style.display = 'none';
    }
}

async function handleLostFormSubmit(e) {
    e.preventDefault();
    if (!validateForm('lost')) return;

    const itemData = {
        title: document.getElementById('item-title').value,
        category: document.getElementById('item-category').value,
        description: document.getElementById('item-description').value,
        location: document.getElementById('item-location').value,
        date_lost_found: document.getElementById('item-date').value,
        status: 'lost'
    };

    try {
        await apiCall(API_ENDPOINTS.LOST_FOUND.CREATE, {
            method: 'POST',
            body: JSON.stringify(itemData)
        });

        modalMessage.textContent = "Your lost item report has been submitted successfully.";
        successModal.style.display = 'flex';
        resetForm('lost');
        hideReportForm('lost');
        await loadItems();
    } catch (error) {
        alert('Failed to submit report: ' + error.message);
    }
}

async function handleFoundFormSubmit(e) {
    e.preventDefault();
    if (!validateForm('found')) return;

    const itemData = {
        title: document.getElementById('found-item-title').value,
        category: document.getElementById('found-item-category').value,
        description: document.getElementById('found-item-description').value,
        location: document.getElementById('found-item-location').value,
        date_lost_found: document.getElementById('found-item-date').value,
        storage_location: document.getElementById('storage-location').value,
        status: 'found'
    };

    try {
        await apiCall(API_ENDPOINTS.LOST_FOUND.CREATE, {
            method: 'POST',
            body: JSON.stringify(itemData)
        });

        modalMessage.textContent = "Your found item report has been submitted successfully.";
        successModal.style.display = 'flex';
        resetForm('found');
        hideReportForm('found');
        await loadItems();
    } catch (error) {
        alert('Failed to submit report: ' + error.message);
    }
}

function validateForm(type) {
    let valid = true;
    const prefix = type === 'lost' ? '' : 'found-';
    hideAllErrors(type);

    if (!document.getElementById(`${prefix}item-title`).value.trim()) { 
        document.getElementById(`${prefix}title-error`).style.display = 'block'; 
        valid = false; 
    }
    if (!document.getElementById(`${prefix}item-category`).value) { 
        document.getElementById(`${prefix}category-error`).style.display = 'block'; 
        valid = false; 
    }
    if (!document.getElementById(`${prefix}item-description`).value.trim()) { 
        document.getElementById(`${prefix}description-error`).style.display = 'block'; 
        valid = false; 
    }
    if (!document.getElementById(`${prefix}item-location`).value.trim()) { 
        document.getElementById(`${prefix}location-error`).style.display = 'block'; 
        valid = false; 
    }
    if (!document.getElementById(`${prefix}item-date`).value) { 
        document.getElementById(`${prefix}date-error`).style.display = 'block'; 
        valid = false; 
    }

    if (type === 'found' && !document.getElementById('storage-location').value.trim()) { 
        document.getElementById('storage-error').style.display = 'block'; 
        valid = false; 
    }

    return valid;
}

async function performSearch() {
    const term = searchInput.value.toLowerCase().trim();
    
    if (!term) {
        await loadItems();
        return;
    }

    try {
        const items = await apiCall(API_ENDPOINTS.LOST_FOUND.SEARCH(term));
        
        const lostItems = items.filter(item => item.status === 'lost');
        const foundItems = items.filter(item => item.status === 'found');
        
        displayLostItems(lostItems);
        displayFoundItems(foundItems);
    } catch (error) {
        console.error('Search error:', error);
    }
}

function closeSuccessModal() { 
    successModal.style.display = 'none'; 
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}