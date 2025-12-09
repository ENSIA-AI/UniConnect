// Sample data for lost items
const sampleLostItems = [
    { id: 1, title: "Black Wallet", category: "wallet", description: "Lost a black leather wallet with university ID and credit cards inside.", location: "Library - 2nd Floor", date: "2023-10-15", contact: "john.doe@university.edu", image: null, status: "lost" },
    { id: 2, title: "iPhone 12", category: "phone", description: "Silver iPhone 12 with a blue case. Has a crack on the bottom right corner.", location: "Student Center Cafeteria", date: "2023-10-14", contact: "sarah.wilson@university.edu", image: null, status: "lost" },
    { id: 3, title: "Calculus Textbook", category: "book", description: "Calculus textbook with notes in the margins.", location: "Math Building - Room 204", date: "2023-10-13", contact: "mike.johnson@university.edu", image: null, status: "lost" }
];

// Sample data for found items
const sampleFoundItems = [
    { id: 101, title: "Blue Water Bottle", category: "other", description: "Found a blue Hydro Flask water bottle with stickers on it.", location: "Gym - Locker Room", date: "2023-10-16", contact: "campus.security@university.edu", storage: "Campus Security Office", image: null, status: "found" },
    { id: 102, title: "Wireless Headphones", category: "electronics", description: "Found Sony wireless headphones in a black case.", location: "Library - Study Area", date: "2023-10-15", contact: "library.frontdesk@university.edu", storage: "Library Lost & Found", image: null, status: "found" }
];

// DOM Elements
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

// Image upload elements
const lostImageUpload = document.getElementById('lost-image-upload');
const lostItemImage = document.getElementById('lost-item-image');
const lostImagePreview = document.getElementById('lost-image-preview');
const lostPreviewImg = document.getElementById('lost-preview-img');
const removeLostImageBtn = document.getElementById('remove-lost-image');

const foundImageUpload = document.getElementById('found-image-upload');
const foundItemImage = document.getElementById('found-item-image');
const foundImagePreview = document.getElementById('found-image-preview');
const foundPreviewImg = document.getElementById('found-preview-img');
const removeFoundImageBtn = document.getElementById('remove-found-image');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    displayLostItems(sampleLostItems);
    displayFoundItems(sampleFoundItems);
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    reportLostBtn.addEventListener('click', () => showReportForm('lost'));
    reportFoundBtn.addEventListener('click', () => showReportForm('found'));
    cancelLostFormBtn.addEventListener('click', () => hideReportForm('lost'));
    cancelFoundFormBtn.addEventListener('click', () => hideReportForm('found'));

    lostItemForm.addEventListener('submit', handleLostFormSubmit);
    foundItemForm.addEventListener('submit', handleFoundFormSubmit);

    lostImageUpload.addEventListener('click', () => lostItemImage.click());
    lostItemImage.addEventListener('change', (e) => handleImageUpload(e, lostPreviewImg, lostImagePreview, lostImageUpload));
    removeLostImageBtn.addEventListener('click', () => removeImage(lostItemImage, lostImagePreview, lostImageUpload));

    foundImageUpload.addEventListener('click', () => foundItemImage.click());
    foundItemImage.addEventListener('change', (e) => handleImageUpload(e, foundPreviewImg, foundImagePreview, foundImageUpload));
    removeFoundImageBtn.addEventListener('click', () => removeImage(foundItemImage, foundImagePreview, foundImageUpload));

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

    closeModal.addEventListener('click', closeSuccessModal);
    modalOk.addEventListener('click', closeSuccessModal);
    window.addEventListener('click', (e) => { if (e.target === successModal) closeSuccessModal(); });
}

// Display functions
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

// Create item card
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    const icon = getCategoryIcon(item.category);
    const date = formatDate(item.date);
    const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
    const storage = item.storage ? `<div><i class="fas fa-box"></i> Stored at: ${item.storage}</div>` : '';

    card.innerHTML = `
        <div class="item-image">${item.image ? `<img src="${item.image}">` : `<i class="${icon}"></i>`}</div>
        <div class="item-details">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="item-meta">
                <div><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
                <div><i class="fas fa-calendar-alt"></i> ${date}</div>
                <div><i class="fas fa-envelope"></i> ${item.contact}</div>
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

// Form visibility
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

// Reset forms
function resetForm(type) {
    const form = type === 'lost' ? lostItemForm : foundItemForm;
    form.reset();
    hideAllErrors(type);
    if (type === 'lost') {
        lostImagePreview.style.display = 'none';
        lostImageUpload.style.display = 'block';
    } else {
        foundImagePreview.style.display = 'none';
        foundImageUpload.style.display = 'block';
    }
}

function hideAllErrors(type) {
    const prefix = type === 'lost' ? '' : 'found-';
    ['title', 'category', 'description', 'location', 'date', 'email'].forEach(id => {
        document.getElementById(`${prefix}${id}-error`).style.display = 'none';
    });
    if (type === 'found') document.getElementById('storage-error').style.display = 'none';
}

// Form submissions
function handleLostFormSubmit(e) {
    e.preventDefault();
    if (!validateForm('lost')) return;

    // Read values first
    const title = document.getElementById('item-title').value;
    const category = document.getElementById('item-category').value;
    const description = document.getElementById('item-description').value;
    const location = document.getElementById('item-location').value;
    const date = document.getElementById('item-date').value;
    const contact = document.getElementById('contact-email').value;

    const newItem = { id: sampleLostItems.length + 1, title, category, description, location, date, contact, image: null, status: 'lost' };
    sampleLostItems.unshift(newItem);
    displayLostItems(sampleLostItems);

    modalMessage.textContent = "Your lost item report has been submitted successfully.";
    successModal.style.display = 'flex';
    resetForm('lost');
    hideReportForm('lost');
}

function handleFoundFormSubmit(e) {
    e.preventDefault();
    if (!validateForm('found')) return;

    const title = document.getElementById('found-item-title').value;
    const category = document.getElementById('found-item-category').value;
    const description = document.getElementById('found-item-description').value;
    const location = document.getElementById('found-item-location').value;
    const date = document.getElementById('found-item-date').value;
    const contact = document.getElementById('found-contact-email').value;
    const storage = document.getElementById('storage-location').value;

    const newItem = { id: sampleFoundItems.length + 101, title, category, description, location, date, contact, storage, image: null, status: 'found' };
    sampleFoundItems.unshift(newItem);
    displayFoundItems(sampleFoundItems);

    modalMessage.textContent = "Your found item report has been submitted successfully.";
    successModal.style.display = 'flex';
    resetForm('found');
    hideReportForm('found');
}

// Form validation
function validateForm(type) {
    let valid = true;
    const prefix = type === 'lost' ? '' : 'found-';
    hideAllErrors(type);

    if (!document.getElementById(`${prefix}item-title`).value.trim()) { document.getElementById(`${prefix}title-error`).style.display = 'block'; valid = false; }
    if (!document.getElementById(`${prefix}item-category`).value) { document.getElementById(`${prefix}category-error`).style.display = 'block'; valid = false; }
    if (!document.getElementById(`${prefix}item-description`).value.trim()) { document.getElementById(`${prefix}description-error`).style.display = 'block'; valid = false; }
    if (!document.getElementById(`${prefix}item-location`).value.trim()) { document.getElementById(`${prefix}location-error`).style.display = 'block'; valid = false; }
    if (!document.getElementById(`${prefix}item-date`).value) { document.getElementById(`${prefix}date-error`).style.display = 'block'; valid = false; }

    const emailField = type === 'lost' ? 'contact-email' : 'found-contact-email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(document.getElementById(emailField).value)) { document.getElementById(`${prefix}email-error`).style.display = 'block'; valid = false; }

    if (type === 'found' && !document.getElementById('storage-location').value.trim()) { document.getElementById('storage-error').style.display = 'block'; valid = false; }

    return valid;
}

// Image handlers
function handleImageUpload(e, previewImg, imagePreview, imageUpload) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { previewImg.src = ev.target.result; imagePreview.style.display = 'block'; imageUpload.style.display = 'none'; };
    reader.readAsDataURL(file);
}

function removeImage(input, preview, upload) {
    input.value = '';
    preview.style.display = 'none';
    upload.style.display = 'block';
}

// Search
function performSearch() {
    const term = searchInput.value.toLowerCase().trim();
    if (!term) { displayLostItems(sampleLostItems); displayFoundItems(sampleFoundItems); return; }

    const filteredLost = sampleLostItems.filter(item => item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term) || item.location.toLowerCase().includes(term) || item.category.toLowerCase().includes(term));
    const filteredFound = sampleFoundItems.filter(item => item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term) || item.location.toLowerCase().includes(term) || item.category.toLowerCase().includes(term));

    displayLostItems(filteredLost);
    displayFoundItems(filteredFound);
}

// Modal
function closeSuccessModal() { successModal.style.display = 'none'; }