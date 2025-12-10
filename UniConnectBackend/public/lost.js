/**
 * Lost and Found System - Frontend JavaScript
 * Handles all frontend functionality
 */

// API Configuration
// Use this to work with both:
// API Configuration - USE THIS EXACT URL
const API_BASE_URL = 'http://localhost:8000/api/items';

// OR use dynamic URL based on current location
// const API_BASE_URL = `${window.location.origin}/api/items`;
// DOM Elements - Get all necessary HTML elements
const lostItemsContainer = document.getElementById('lost-items-container');
const foundItemsContainer = document.getElementById('found-items-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const reportLostBtn = document.getElementById('report-lost-btn');
const reportFoundBtn = document.getElementById('report-found-btn');
const successModal = document.getElementById('success-modal');
const modalOk = document.getElementById('modal-ok');
const modalMessage = document.getElementById('modal-message');

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Lost and Found System Initialized');
    
    // Load initial data from API
    loadLostItems();
    loadFoundItems();
    
    // Setup all event listeners
    setupEventListeners();
    
    // Setup image upload functionality
    setupImageUpload('lost');
    setupImageUpload('found');
});

/**
 * Setup all event listeners for the application
 */
function setupEventListeners() {
    // Report buttons - show forms
    reportLostBtn.addEventListener('click', () => showReportForm('lost'));
    reportFoundBtn.addEventListener('click', () => showReportForm('found'));
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Form submissions
    document.getElementById('lost-item-form').addEventListener('submit', handleLostFormSubmit);
    document.getElementById('found-item-form').addEventListener('submit', handleFoundFormSubmit);
    
    // Cancel buttons - hide forms
    document.getElementById('cancel-lost-form').addEventListener('click', () => hideReportForm('lost'));
    document.getElementById('cancel-found-form').addEventListener('click', () => hideReportForm('found'));
    
    // Modal controls
    modalOk.addEventListener('click', closeSuccessModal);
    document.querySelector('.close-modal').addEventListener('click', closeSuccessModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === successModal) closeSuccessModal();
    });
}

/**
 * Load lost items from API
 */
async function loadLostItems() {
    try {
        console.log('Loading lost items from API...');
        const response = await fetch(`${API_BASE_URL}/lost`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Lost items loaded successfully:', data.data.length);
            displayLostItems(data.data);
        } else {
            console.error('API returned error:', data);
            showErrorMessage('Failed to load lost items');
        }
    } catch (error) {
        console.error('Error loading lost items:', error);
        showErrorMessage('Cannot connect to server. Using sample data.');
        displayLostItems(getSampleLostItems());
    }
}

/**
 * Load found items from API
 */
async function loadFoundItems() {
    try {
        console.log('Loading found items from API...');
        const response = await fetch(`${API_BASE_URL}/found`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Found items loaded successfully:', data.data.length);
            displayFoundItems(data.data);
        } else {
            console.error('API returned error:', data);
            showErrorMessage('Failed to load found items');
        }
    } catch (error) {
        console.error('Error loading found items:', error);
        showErrorMessage('Cannot connect to server. Using sample data.');
        displayFoundItems(getSampleFoundItems());
    }
}

/**
 * Display lost items in the UI
 * @param {Array} items - Array of lost items
 */
function displayLostItems(items) {
    lostItemsContainer.innerHTML = '';
    
    if (!items || items.length === 0) {
        // Show message when no items
        lostItemsContainer.innerHTML = `
            <div class="no-items">
                <i class="fas fa-search"></i>
                <h3>No lost items found</h3>
                <p>Be the first to report a lost item!</p>
            </div>
        `;
        return;
    }
    
    // Create and append item cards
    items.forEach(item => {
        lostItemsContainer.appendChild(createItemCard(item));
    });
}

/**
 * Display found items in the UI
 * @param {Array} items - Array of found items
 */
function displayFoundItems(items) {
    foundItemsContainer.innerHTML = '';
    
    if (!items || items.length === 0) {
        // Show message when no items
        foundItemsContainer.innerHTML = `
            <div class="no-items">
                <i class="fas fa-search"></i>
                <h3>No found items available</h3>
                <p>Check back later or report a found item!</p>
            </div>
        `;
        return;
    }
    
    // Create and append item cards
    items.forEach(item => {
        foundItemsContainer.appendChild(createItemCard(item));
    });
}

/**
 * Create HTML card for an item
 * @param {Object} item - Item data
 * @returns {HTMLElement} - Item card element
 */
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    
    // Get icon based on category
    const icon = getCategoryIcon(item.category);
    
    // Format date for display
    const date = formatDate(item.date);
    
    // Determine status class and text
    const statusClass = item.type === 'lost' ? 'status-lost' : 'status-found';
    const statusText = item.type === 'lost' ? 'Lost' : 'Found';
    
    // Add storage location if it's a found item
    const storageInfo = item.storage_location 
        ? `<div class="item-storage"><i class="fas fa-box"></i> Stored at: ${item.storage_location}</div>` 
        : '';
    
    // Create card HTML
    card.innerHTML = `
        <div class="item-image">
            ${item.image 
                ? `<img src="/storage/${item.image}" alt="${item.title}">`
                : `<i class="${icon}"></i>`
            }
        </div>
        <div class="item-details">
            <h3 class="item-title">${item.title}</h3>
            <p class="item-description">${item.description}</p>
            <div class="item-meta">
                <div><i class="fas fa-tag"></i> ${item.category}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
                <div><i class="fas fa-calendar-alt"></i> ${date}</div>
                <div><i class="fas fa-envelope"></i> ${item.contact_email}</div>
                ${storageInfo}
            </div>
            <div class="item-status ${statusClass}">${statusText}</div>
        </div>
    `;
    
    return card;
}

/**
 * Get Font Awesome icon based on category
 * @param {String} category - Item category
 * @returns {String} - Icon class name
 */
function getCategoryIcon(category) {
    const iconMap = {
        wallet: 'fas fa-wallet',
        phone: 'fas fa-mobile-alt',
        keys: 'fas fa-key',
        book: 'fas fa-book',
        electronics: 'fas fa-laptop',
        clothing: 'fas fa-tshirt',
        other: 'fas fa-question-circle'
    };
    
    return iconMap[category] || 'fas fa-question-circle';
}

/**
 * Format date string for display
 * @param {String} dateStr - Date string
 * @returns {String} - Formatted date
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

/**
 * Show report form (lost or found)
 * @param {String} type - 'lost' or 'found'
 */
function showReportForm(type) {
    if (type === 'lost') {
        document.getElementById('lost-report-form').style.display = 'block';
        document.getElementById('found-report-form').style.display = 'none';
        // Scroll to form
        document.getElementById('lost-report-form').scrollIntoView({ behavior: 'smooth' });
    } else {
        document.getElementById('found-report-form').style.display = 'block';
        document.getElementById('lost-report-form').style.display = 'none';
        // Scroll to form
        document.getElementById('found-report-form').scrollIntoView({ behavior: 'smooth' });
    }
}

/**
 * Hide report form
 * @param {String} type - 'lost' or 'found'
 */
function hideReportForm(type) {
    if (type === 'lost') {
        document.getElementById('lost-report-form').style.display = 'none';
        resetForm('lost');
    } else {
        document.getElementById('found-report-form').style.display = 'none';
        resetForm('found');
    }
}

/**
 * Reset form to initial state
 * @param {String} type - 'lost' or 'found'
 */
function resetForm(type) {
    const form = type === 'lost' 
        ? document.getElementById('lost-item-form') 
        : document.getElementById('found-item-form');
    
    form.reset();
    hideAllErrors(type);
    
    // Reset image preview
    if (type === 'lost') {
        document.getElementById('lost-image-preview').style.display = 'none';
        document.getElementById('lost-image-upload').style.display = 'block';
    } else {
        document.getElementById('found-image-preview').style.display = 'none';
        document.getElementById('found-image-upload').style.display = 'block';
    }
}

/**
 * Handle lost item form submission
 * @param {Event} e - Form submit event
 */
async function handleLostFormSubmit(e) {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm('lost')) return;
    
    try {
        // Create FormData object for file upload
        const formData = new FormData();
        
        // Add form fields to FormData
        formData.append('title', document.getElementById('item-title').value);
        formData.append('category', document.getElementById('item-category').value);
        formData.append('description', document.getElementById('item-description').value);
        formData.append('location', document.getElementById('item-location').value);
        formData.append('date', document.getElementById('item-date').value);
        formData.append('contact_email', document.getElementById('contact-email').value);
        
        // Add image if selected
        const imageFile = document.getElementById('lost-item-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        // Send POST request to API
        const response = await fetch(`${API_BASE_URL}/lost`, {
            method: 'POST',
            body: formData
            // Note: Don't set Content-Type header for FormData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showSuccessMessage('Lost item reported successfully!');
            
            // Reset form and hide it
            resetForm('lost');
            hideReportForm('lost');
            
            // Reload lost items list
            loadLostItems();
        } else {
            // Show validation errors
            showValidationErrors(data.errors);
        }
    } catch (error) {
        console.error('Error submitting lost item:', error);
        showErrorMessage('Failed to report lost item. Please try again.');
    }
}

/**
 * Handle found item form submission
 * @param {Event} e - Form submit event
 */
async function handleFoundFormSubmit(e) {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm('found')) return;
    
    try {
        // Create FormData object for file upload
        const formData = new FormData();
        
        // Add form fields to FormData
        formData.append('title', document.getElementById('found-item-title').value);
        formData.append('category', document.getElementById('found-item-category').value);
        formData.append('description', document.getElementById('found-item-description').value);
        formData.append('location', document.getElementById('found-item-location').value);
        formData.append('date', document.getElementById('found-item-date').value);
        formData.append('contact_email', document.getElementById('found-contact-email').value);
        formData.append('storage_location', document.getElementById('storage-location').value);
        
        // Add image if selected
        const imageFile = document.getElementById('found-item-image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }
        
        // Send POST request to API
        const response = await fetch(`${API_BASE_URL}/found`, {
            method: 'POST',
            body: formData
            // Note: Don't set Content-Type header for FormData
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showSuccessMessage('Found item reported successfully!');
            
            // Reset form and hide it
            resetForm('found');
            hideReportForm('found');
            
            // Reload found items list
            loadFoundItems();
        } else {
            // Show validation errors
            showValidationErrors(data.errors);
        }
    } catch (error) {
        console.error('Error submitting found item:', error);
        showErrorMessage('Failed to report found item. Please try again.');
    }
}

/**
 * Validate form fields
 * @param {String} type - 'lost' or 'found'
 * @returns {Boolean} - True if valid, false otherwise
 */
function validateForm(type) {
    let isValid = true;
    const prefix = type === 'lost' ? '' : 'found-';
    
    // Hide all error messages first
    hideAllErrors(type);
    
    // Get form elements based on type
    const titleField = document.getElementById(`${prefix}item-title`);
    const categoryField = document.getElementById(`${prefix}item-category`);
    const descriptionField = document.getElementById(`${prefix}item-description`);
    const locationField = document.getElementById(`${prefix}item-location`);
    const dateField = document.getElementById(`${prefix}item-date`);
    const emailField = type === 'lost' 
        ? document.getElementById('contact-email') 
        : document.getElementById('found-contact-email');
    
    // Validate each field
    if (!titleField.value.trim()) {
        document.getElementById(`${prefix}title-error`).style.display = 'block';
        isValid = false;
    }
    
    if (!categoryField.value) {
        document.getElementById(`${prefix}category-error`).style.display = 'block';
        isValid = false;
    }
    
    if (!descriptionField.value.trim()) {
        document.getElementById(`${prefix}description-error`).style.display = 'block';
        isValid = false;
    }
    
    if (!locationField.value.trim()) {
        document.getElementById(`${prefix}location-error`).style.display = 'block';
        isValid = false;
    }
    
    if (!dateField.value) {
        document.getElementById(`${prefix}date-error`).style.display = 'block';
        isValid = false;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailField.value)) {
        document.getElementById(`${prefix}email-error`).style.display = 'block';
        isValid = false;
    }
    
    // Additional validation for found items
    if (type === 'found') {
        const storageField = document.getElementById('storage-location');
        if (!storageField.value.trim()) {
            document.getElementById('storage-error').style.display = 'block';
            isValid = false;
        }
    }
    
    return isValid;
}

/**
 * Hide all error messages for a form
 * @param {String} type - 'lost' or 'found'
 */
function hideAllErrors(type) {
    const prefix = type === 'lost' ? '' : 'found-';
    const errorIds = ['title', 'category', 'description', 'location', 'date', 'email'];
    
    errorIds.forEach(id => {
        const errorElement = document.getElementById(`${prefix}${id}-error`);
        if (errorElement) errorElement.style.display = 'none';
    });
    
    if (type === 'found') {
        const storageError = document.getElementById('storage-error');
        if (storageError) storageError.style.display = 'none';
    }
}

/**
 * Setup image upload functionality
 * @param {String} type - 'lost' or 'found'
 */
function setupImageUpload(type) {
    const uploadContainer = document.getElementById(`${type}-image-upload`);
    const fileInput = document.getElementById(`${type}-item-image`);
    const previewContainer = document.getElementById(`${type}-image-preview`);
    const previewImg = document.getElementById(`${type}-preview-img`);
    const removeBtn = document.getElementById(`remove-${type}-image`);
    
    if (!uploadContainer || !fileInput) return;
    
    // Click on upload area to trigger file input
    uploadContainer.addEventListener('click', () => fileInput.click());
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageUpload(e.target.files[0], previewImg, previewContainer, uploadContainer);
        }
    });
    
    // Handle drag and drop
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.style.backgroundColor = '#f0f0f0';
    });
    
    uploadContainer.addEventListener('dragleave', () => {
        uploadContainer.style.backgroundColor = '';
    });
    
    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleImageUpload(e.dataTransfer.files[0], previewImg, previewContainer, uploadContainer);
        }
    });
    
    // Handle remove image button
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            fileInput.value = '';
            previewContainer.style.display = 'none';
            uploadContainer.style.display = 'block';
        });
    }
}

/**
 * Handle image upload and preview
 * @param {File} file - Image file
 * @param {HTMLElement} previewImg - Image element for preview
 * @param {HTMLElement} previewContainer - Container for preview
 * @param {HTMLElement} uploadContainer - Upload area container
 */
function handleImageUpload(file, previewImg, previewContainer, uploadContainer) {
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showErrorMessage('Please select an image file (JPEG, PNG, GIF)');
        return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showErrorMessage('Image size should be less than 2MB');
        return;
    }
    
    // Create FileReader to preview image
    const reader = new FileReader();
    
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        previewContainer.style.display = 'block';
        uploadContainer.style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

/**
 * Perform search across items
 */
async function performSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        // If search is empty, reload all items
        loadLostItems();
        loadFoundItems();
        return;
    }
    
    try {
        // Send search request to API
        const response = await fetch(`${API_BASE_URL}/search?keyword=${encodeURIComponent(searchTerm)}&type=all`);
        const data = await response.json();
        
        if (data.success) {
            // Separate lost and found items
            const lostItems = data.data.filter(item => item.type === 'lost');
            const foundItems = data.data.filter(item => item.type === 'found');
            
            // Display results
            displayLostItems(lostItems);
            displayFoundItems(foundItems);
        }
    } catch (error) {
        console.error('Error searching items:', error);
        showErrorMessage('Search failed. Please try again.');
    }
}

/**
 * Show success modal with message
 * @param {String} message - Success message to display
 */
function showSuccessMessage(message) {
    modalMessage.textContent = message;
    successModal.style.display = 'flex';
}

/**
 * Close success modal
 */
function closeSuccessModal() {
    successModal.style.display = 'none';
}

/**
 * Show error message (you can implement this as needed)
 * @param {String} message - Error message
 */
function showErrorMessage(message) {
    // You can implement a toast notification or alert
    alert(message); // Simple alert for now
}

/**
 * Show validation errors from API response
 * @param {Object} errors - Validation errors object
 */
function showValidationErrors(errors) {
    // Loop through errors and display them
    for (const field in errors) {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = errors[field][0];
            errorElement.style.display = 'block';
        }
    }
}

/**
 * Sample data for testing (used when API fails)
 */
function getSampleLostItems() {
    return [
        { 
            id: 1, 
            title: "Black Wallet", 
            category: "wallet", 
            description: "Lost a black leather wallet with university ID and credit cards inside.", 
            location: "Library - 2nd Floor", 
            date: "2024-01-15", 
            contact_email: "john.doe@university.edu", 
            image: null, 
            type: "lost",
            status: "pending"
        },
        { 
            id: 2, 
            title: "iPhone 12", 
            category: "phone", 
            description: "Silver iPhone 12 with a blue case.", 
            location: "Student Center Cafeteria", 
            date: "2024-01-14", 
            contact_email: "sarah@university.edu", 
            image: null, 
            type: "lost",
            status: "pending"
        }
    ];
}

function getSampleFoundItems() {
    return [
        { 
            id: 101, 
            title: "Blue Water Bottle", 
            category: "other", 
            description: "Found a blue Hydro Flask water bottle with stickers.", 
            location: "Gym - Locker Room", 
            date: "2024-01-16", 
            contact_email: "security@university.edu", 
            storage_location: "Campus Security Office",
            image: null, 
            type: "found",
            status: "pending"
        }
    ];
}