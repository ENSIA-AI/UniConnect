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
    setupHamburgerMenu();
    loadItemsFromDatabase();
    
    // Load items from database
    loadItemsFromDatabase();
});

// Load items from database
function loadItemsFromDatabase() {
    fetch('/UniConnectBackend/lostandfound.php?status=lost')
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                sampleLostItems.length = 0;
                sampleLostItems.push(...data.data);
            }
            displayLostItems(sampleLostItems);
        })
        .catch(err => {
            console.log('Could not load lost items from database:', err);
            displayLostItems(sampleLostItems);
        });
    
    fetch('/UniConnectBackend/lostandfound.php?status=found')
        .then(response => response.json())
        .then(data => {
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                sampleFoundItems.length = 0;
                sampleFoundItems.push(...data.data);
            }
            displayFoundItems(sampleFoundItems);
        })
        .catch(err => {
            console.log('Could not load found items from database:', err);
            displayFoundItems(sampleFoundItems);
        });
}

// Event listeners
function setupEventListeners() {
    if (reportLostBtn) reportLostBtn.addEventListener('click', () => showReportForm('lost'));
    if (reportFoundBtn) reportFoundBtn.addEventListener('click', () => showReportForm('found'));
    if (cancelLostFormBtn) cancelLostFormBtn.addEventListener('click', () => hideReportForm('lost'));
    if (cancelFoundFormBtn) cancelFoundFormBtn.addEventListener('click', () => hideReportForm('found'));

    if (lostItemForm) lostItemForm.addEventListener('submit', handleLostFormSubmit);
    if (foundItemForm) foundItemForm.addEventListener('submit', handleFoundFormSubmit);

    if (lostImageUpload) lostImageUpload.addEventListener('click', () => lostItemImage.click());
    if (lostItemImage) lostItemImage.addEventListener('change', (e) => handleImageUpload(e, lostPreviewImg, lostImagePreview, lostImageUpload));
    if (removeLostImageBtn) removeLostImageBtn.addEventListener('click', () => removeImage(lostItemImage, lostImagePreview, lostImageUpload));

    if (foundImageUpload) foundImageUpload.addEventListener('click', () => foundItemImage.click());
    if (foundItemImage) foundItemImage.addEventListener('change', (e) => handleImageUpload(e, foundPreviewImg, foundImagePreview, foundImageUpload));
    if (removeFoundImageBtn) removeFoundImageBtn.addEventListener('click', () => removeImage(foundItemImage, foundImagePreview, foundImageUpload));

    if (searchBtn) searchBtn.addEventListener('click', performSearch);
    if (searchInput) searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') performSearch(); });

    if (closeModal) closeModal.addEventListener('click', closeSuccessModal);
    if (modalOk) modalOk.addEventListener('click', closeSuccessModal);
    window.addEventListener('click', (e) => { if (e.target === successModal) closeSuccessModal(); });
}

// Hamburger Menu Setup
function setupHamburgerMenu() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
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
    const date = formatDate(item.date || item.date_lost_found);
    const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
    const storage = item.storage || item.storage_location ? `<div><i class="fas fa-box"></i> Stored at: ${item.storage || item.storage_location}</div>` : '';
    const contact = item.contact || item.contact_email;

    card.innerHTML = `
        <div class="item-image">${item.image || item.image_url ? `<img src="${item.image || item.image_url}">` : `<i class="${icon}"></i>`}</div>
        <div class="item-details">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="item-meta">
                <div><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
                <div><i class="fas fa-calendar-alt"></i> ${date}</div>
                <div><i class="fas fa-envelope"></i> ${contact}</div>
                ${storage}
            </div>
            <div class="item-status ${statusClass}">${item.status === 'lost' ? 'Lost' : 'Found'}</div>
            <div class="item-actions">
                <button class="edit-btn" onclick="editItem(${item.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i> Delete</button>
            </div>
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
        const element = document.getElementById(`${prefix}${id}-error`);
        if (element) element.style.display = 'none';
    });
    const storageError = document.getElementById('storage-error');
    if (type === 'found' && storageError) storageError.style.display = 'none';
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

    console.log('Form values:', {title, category, description, location, date, contact});

    const itemData = {
        title: title,
        category: category,
        description: description,
        location: location,
        date_lost_found: date,
        contact_email: contact,
        status: 'lost'
    };
    
    console.log('Sending itemData to lostandfound.php:', itemData);

    // Send to backend API
    fetch('/UniConnectBackend/lostandfound.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        return response.text();
    })
    .then(text => {
        console.log('Raw response text:', text);
        console.log('Response length:', text.length);
        if (!text) {
            modalMessage.textContent = "Error: Empty response from server";
            successModal.style.display = 'flex';
            return;
        }
        try {
            const data = JSON.parse(text);
            console.log('Response data:', data);
            if (data.error) {
                modalMessage.textContent = "Error: " + data.error;
                successModal.style.display = 'flex';
            } else if (data.item_id) {
                modalMessage.textContent = "Your lost item report has been submitted successfully.";
                successModal.style.display = 'flex';
                resetForm('lost');
                hideReportForm('lost');
                // Reload items from database
                setTimeout(loadItemsFromDatabase, 500);
            } else {
                modalMessage.textContent = "Error: Unknown response - " + JSON.stringify(data);
                successModal.style.display = 'flex';
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Failed to parse:', text.substring(0, 200));
            modalMessage.textContent = "Error parsing server response: " + text.substring(0, 100);
            successModal.style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        modalMessage.textContent = "Error submitting form: " + error.message;
        successModal.style.display = 'flex';
    });
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

    const itemData = {
        title: title,
        category: category,
        description: description,
        location: location,
        date_lost_found: date,
        contact_email: contact,
        storage_location: storage,
        status: 'found'
    };

    // Send to backend API
    fetch('/UniConnectBackend/lostandfound.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
        },
        body: JSON.stringify(itemData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        return response.text();
    })
    .then(text => {
        console.log('Raw response text:', text);
        console.log('Response length:', text.length);
        if (!text) {
            modalMessage.textContent = "Error: Empty response from server";
            successModal.style.display = 'flex';
            return;
        }
        try {
            const data = JSON.parse(text);
            console.log('Response data:', data);
            if (data.error) {
                modalMessage.textContent = "Error: " + data.error;
                successModal.style.display = 'flex';
            } else if (data.item_id) {
                modalMessage.textContent = "Your found item report has been submitted successfully.";
                successModal.style.display = 'flex';
                resetForm('found');
                hideReportForm('found');
                // Reload items from database
                setTimeout(loadItemsFromDatabase, 500);
            } else {
                modalMessage.textContent = "Error: Unknown response - " + JSON.stringify(data);
                successModal.style.display = 'flex';
            }
        } catch (e) {
            console.error('JSON parse error:', e);
            console.error('Failed to parse:', text.substring(0, 200));
            modalMessage.textContent = "Error parsing server response: " + text.substring(0, 100);
            successModal.style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        modalMessage.textContent = "Error submitting form. Please check console and try again.";
        successModal.style.display = 'flex';
    });
}

// Form validation
function validateForm(type) {
    let valid = true;
    const prefix = type === 'lost' ? '' : 'found-';
    hideAllErrors(type);

    const titleEl = document.getElementById(`${prefix}item-title`);
    if (!titleEl || !titleEl.value.trim()) {
        const error = document.getElementById(`${prefix}title-error`);
        if (error) error.style.display = 'block';
        valid = false;
    }

    const categoryEl = document.getElementById(`${prefix}item-category`);
    if (!categoryEl || !categoryEl.value) {
        const error = document.getElementById(`${prefix}category-error`);
        if (error) error.style.display = 'block';
        valid = false;
    }

    const descEl = document.getElementById(`${prefix}item-description`);
    if (!descEl || !descEl.value.trim()) {
        const error = document.getElementById(`${prefix}description-error`);
        if (error) error.style.display = 'block';
        valid = false;
    }

    const locEl = document.getElementById(`${prefix}item-location`);
    if (!locEl || !locEl.value.trim()) {
        const error = document.getElementById(`${prefix}location-error`);
        if (error) error.style.display = 'block';
        valid = false;
    }

    const dateEl = document.getElementById(`${prefix}item-date`);
    if (!dateEl || !dateEl.value) {
        const error = document.getElementById(`${prefix}date-error`);
        if (error) error.style.display = 'block';
        valid = false;
    }

    const emailField = type === 'lost' ? 'contact-email' : 'found-contact-email';
    const emailEl = document.getElementById(emailField);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailEl || !emailRegex.test(emailEl.value)) {
        const error = document.getElementById(`${prefix}email-error`);
        if (error) error.style.display = 'block';
        valid = false;
    }

    if (type === 'found') {
        const storageEl = document.getElementById('storage-location');
        if (!storageEl || !storageEl.value.trim()) {
            const error = document.getElementById('storage-error');
            if (error) error.style.display = 'block';
            valid = false;
        }
    }

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

// Edit item
function editItem(itemId) {
    // Find the item in either array
    let item = sampleLostItems.find(i => i.id == itemId);
    if (!item) {
        item = sampleFoundItems.find(i => i.id == itemId);
    }

    if (!item) {
        alert('Item not found');
        return;
    }

    // Populate edit form
    document.getElementById('edit-item-id').value = item.id;
    document.getElementById('edit-item-title').value = item.title;
    document.getElementById('edit-item-category').value = item.category;
    document.getElementById('edit-item-description').value = item.description;
    document.getElementById('edit-item-location').value = item.location;
    document.getElementById('edit-item-date').value = item.date_lost_found;
    document.getElementById('edit-contact-email').value = item.contact_email;
    document.getElementById('edit-item-status').value = item.status;
    document.getElementById('edit-storage-location').value = item.storage_location || '';

    // Show edit modal
    document.getElementById('edit-modal').style.display = 'flex';
}

// Submit edit form
function handleEditFormSubmit(e) {
    e.preventDefault();

    const itemId = document.getElementById('edit-item-id').value;
    const itemData = {
        id: itemId,
        title: document.getElementById('edit-item-title').value,
        category: document.getElementById('edit-item-category').value,
        description: document.getElementById('edit-item-description').value,
        location: document.getElementById('edit-item-location').value,
        date_lost_found: document.getElementById('edit-item-date').value,
        contact_email: document.getElementById('edit-contact-email').value,
        status: document.getElementById('edit-item-status').value,
        storage_location: document.getElementById('edit-storage-location').value
    };

    // Send PUT request to backend
    fetch('/UniConnectBackend/lostandfound.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
        },
        body: JSON.stringify(itemData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Update response:', data);
        if (data.status === 'success') {
            modalMessage.textContent = "Item updated successfully.";
            successModal.style.display = 'flex';
            document.getElementById('edit-modal').style.display = 'none';
            // Reload items from database
            setTimeout(loadItemsFromDatabase, 500);
        } else {
            modalMessage.textContent = "Error updating item: " + (data.error || "Unknown error");
            successModal.style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Update error:', error);
        modalMessage.textContent = "Error updating item. Please try again.";
        successModal.style.display = 'flex';
    });
}

// Close edit modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Delete item
function deleteItem(itemId) {
    // Check if user confirms deletion
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }

    // Send DELETE request to backend
    fetch('/UniConnectBackend/lostandfound.php?id=' + itemId, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Bearer ' + (localStorage.getItem('auth_token') || '')
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Delete response:', data);
        if (data.status === 'success' || data.message) {
            modalMessage.textContent = "Item deleted successfully.";
            successModal.style.display = 'flex';
            // Reload items from database
            setTimeout(loadItemsFromDatabase, 500);
        } else {
            modalMessage.textContent = "Error deleting item: " + (data.error || "Unknown error");
            successModal.style.display = 'flex';
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        modalMessage.textContent = "Error deleting item. Please try again.";
        successModal.style.display = 'flex';
    });
}

// Modal
function closeSuccessModal() { successModal.style.display = 'none'; }