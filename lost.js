// Sample data for lost items
const sampleLostItems = [
    {
        id: 1,
        title: "Black Wallet",
        category: "wallet",
        description: "Lost a black leather wallet with university ID and credit cards inside. Has my student ID and driver's license.",
        location: "Library - 2nd Floor",
        date: "2023-10-15",
        contact: "john.doe@university.edu",
        image: null,
        status: "lost"
    },
    {
        id: 2,
        title: "iPhone 12",
        category: "phone",
        description: "Silver iPhone 12 with a blue case. Has a crack on the bottom right corner. Please contact if found.",
        location: "Student Center Cafeteria",
        date: "2023-10-14",
        contact: "sarah.wilson@university.edu",
        image: null,
        status: "lost"
    },
    {
        id: 3,
        title: "Calculus Textbook",
        category: "book",
        description: "Calculus: Early Transcendentals 8th Edition. Has notes in the margins and my name written on the inside cover.",
        location: "Math Building - Room 204",
        date: "2023-10-13",
        contact: "mike.johnson@university.edu",
        image: null,
        status: "lost"
    }
];

// Sample data for found items
const sampleFoundItems = [
    {
        id: 101,
        title: "Blue Water Bottle",
        category: "other",
        description: "Found a blue Hydro Flask water bottle with stickers on it. No identification visible.",
        location: "Gym - Locker Room",
        date: "2023-10-16",
        contact: "campus.security@university.edu",
        storage: "Campus Security Office",
        image: null,
        status: "found"
    },
    {
        id: 102,
        title: "Wireless Headphones",
        category: "electronics",
        description: "Found Sony wireless headphones in a black case. Left at the study tables.",
        location: "Library - Study Area",
        date: "2023-10-15",
        contact: "library.frontdesk@university.edu",
        storage: "Library Lost & Found",
        image: null,
        status: "found"
    }
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

// Image upload elements for lost items
const lostImageUpload = document.getElementById('lost-image-upload');
const lostItemImage = document.getElementById('lost-item-image');
const lostImagePreview = document.getElementById('lost-image-preview');
const lostPreviewImg = document.getElementById('lost-preview-img');
const removeLostImageBtn = document.getElementById('remove-lost-image');

// Image upload elements for found items
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

// Set up event listeners
function setupEventListeners() {
    // Form buttons
    reportLostBtn.addEventListener('click', showLostReportForm);
    reportFoundBtn.addEventListener('click', showFoundReportForm);
    cancelLostFormBtn.addEventListener('click', hideLostReportForm);
    cancelFoundFormBtn.addEventListener('click', hideFoundReportForm);
    
    // Form submission
    lostItemForm.addEventListener('submit', handleLostFormSubmit);
    foundItemForm.addEventListener('submit', handleFoundFormSubmit);
    
    // Image upload for lost items
    lostImageUpload.addEventListener('click', () => lostItemImage.click());
    lostItemImage.addEventListener('change', (e) => handleImageUpload(e, lostPreviewImg, lostImagePreview, lostImageUpload));
    removeLostImageBtn.addEventListener('click', () => removeImage(lostItemImage, lostImagePreview, lostImageUpload));
    
    // Image upload for found items
    foundImageUpload.addEventListener('click', () => foundItemImage.click());
    foundItemImage.addEventListener('change', (e) => handleImageUpload(e, foundPreviewImg, foundImagePreview, foundImageUpload));
    removeFoundImageBtn.addEventListener('click', () => removeImage(foundItemImage, foundImagePreview, foundImageUpload));
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Modal functionality
    closeModal.addEventListener('click', closeSuccessModal);
    modalOk.addEventListener('click', closeSuccessModal);
    window.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeSuccessModal();
        }
    });
}

// Display lost items in the grid
function displayLostItems(items) {
    lostItemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        lostItemsContainer.innerHTML = `
            <div class="no-items">
                <i class="fas fa-search" style="font-size: 3em; color: var(--gray); margin-bottom: 15px;"></i>
                <h3>No lost items found</h3>
                <p>Try adjusting your search criteria or report a new lost item.</p>
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const itemCard = createItemCard(item);
        lostItemsContainer.appendChild(itemCard);
    });
}

// Display found items in the grid
function displayFoundItems(items) {
    foundItemsContainer.innerHTML = '';
    
    if (items.length === 0) {
        foundItemsContainer.innerHTML = `
            <div class="no-items">
                <i class="fas fa-search" style="font-size: 3em; color: var(--gray); margin-bottom: 15px;"></i>
                <h3>No found items available</h3>
                <p>Check back later or report a found item.</p>
            </div>
        `;
        return;
    }
    
    items.forEach(item => {
        const itemCard = createItemCard(item);
        foundItemsContainer.appendChild(itemCard);
    });
}

// Create item card HTML
function createItemCard(item) {
    const itemCard = document.createElement('div');
    itemCard.className = 'item-card';
    
    const categoryIcon = getCategoryIcon(item.category);
    const formattedDate = formatDate(item.date);
    const statusClass = item.status === 'lost' ? 'status-lost' : 'status-found';
    const statusText = item.status === 'lost' ? 'Lost' : 'Found';
    
    // Add storage location for found items
    const storageInfo = item.storage ? `<div><i class="fas fa-box"></i> Stored at: ${item.storage}</div>` : '';
    
    itemCard.innerHTML = `
        <div class="item-image">
            ${item.image ? 
                `<img src="${item.image}" alt="${item.title}">` : 
                `<i class="${categoryIcon}"></i>`
            }
        </div>
        <div class="item-details">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="item-meta">
                <div><i class="fas fa-map-marker-alt"></i> ${item.location}</div>
                <div><i class="fas fa-calendar-alt"></i> ${formattedDate}</div>
                <div><i class="fas fa-envelope"></i> ${item.contact}</div>
                ${storageInfo}
            </div>
            <div class="item-status ${statusClass}">${statusText}</div>
        </div>
    `;
    
    return itemCard;
}

// Get appropriate icon for each category
function getCategoryIcon(category) {
    const icons = {
        wallet: 'fas fa-wallet',
        phone: 'fas fa-mobile-alt',
        keys: 'fas fa-key',
        book: 'fas fa-book',
        electronics: 'fas fa-laptop',
        clothing: 'fas fa-tshirt',
        other: 'fas fa-question-circle'
    };
    
    return icons[category] || 'fas fa-question-circle';
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Show the lost report form
function showLostReportForm() {
    lostReportForm.style.display = 'block';
    foundReportForm.style.display = 'none';
    // Scroll to form
    lostReportForm.scrollIntoView({ behavior: 'smooth' });
}

// Show the found report form
function showFoundReportForm() {
    foundReportForm.style.display = 'block';
    lostReportForm.style.display = 'none';
    // Scroll to form
    foundReportForm.scrollIntoView({ behavior: 'smooth' });
}

// Hide the lost report form
function hideLostReportForm() {
    lostReportForm.style.display = 'none';
    resetLostForm();
}

// Hide the found report form
function hideFoundReportForm() {
    foundReportForm.style.display = 'none';
    resetFoundForm();
}

// Reset lost form to initial state
function resetLostForm() {
    lostItemForm.reset();
    hideAllErrors('lost');
    lostImagePreview.style.display = 'none';
    lostImageUpload.style.display = 'block';
}

// Reset found form to initial state
function resetFoundForm() {
    foundItemForm.reset();
    hideAllErrors('found');
    foundImagePreview.style.display = 'none';
    foundImageUpload.style.display = 'block';
}

// Hide all error messages for a specific form
function hideAllErrors(formType) {
    const prefix = formType === 'lost' ? '' : 'found-';
    document.getElementById(`${prefix}title-error`).style.display = 'none';
    document.getElementById(`${prefix}category-error`).style.display = 'none';
    document.getElementById(`${prefix}description-error`).style.display = 'none';
    document.getElementById(`${prefix}location-error`).style.display = 'none';
    document.getElementById(`${prefix}date-error`).style.display = 'none';
    document.getElementById(`${prefix}email-error`).style.display = 'none';
    
    if (formType === 'found') {
        document.getElementById('storage-error').style.display = 'none';
    }
}

// Handle lost form submission
function handleLostFormSubmit(e) {
    e.preventDefault();
    
    if (validateForm('lost')) {
        // In a real application, you would send the data to a server
        console.log('Lost item form submitted successfully');
        
        // Show success modal
        modalMessage.textContent = "Your lost item report has been submitted successfully. We'll contact you if your item is found.";
        successModal.style.display = 'flex';
        
        // Reset form and hide it
        resetLostForm();
        hideLostReportForm();
        
        // Add the new item to the list (in a real app, this would come from the server)
        const newItem = {
            id: sampleLostItems.length + 1,
            title: document.getElementById('item-title').value,
            category: document.getElementById('item-category').value,
            description: document.getElementById('item-description').value,
            location: document.getElementById('item-location').value,
            date: document.getElementById('item-date').value,
            contact: document.getElementById('contact-email').value,
            image: null, // In a real app, you would upload the image
            status: 'lost'
        };
        
        sampleLostItems.unshift(newItem);
        displayLostItems(sampleLostItems);
    }
}

// Handle found form submission
function handleFoundFormSubmit(e) {
    e.preventDefault();
    
    if (validateForm('found')) {
        // In a real application, you would send the data to a server
        console.log('Found item form submitted successfully');
        
        // Show success modal
        modalMessage.textContent = "Your found item report has been submitted successfully. The owner will be notified.";
        successModal.style.display = 'flex';
        
        // Reset form and hide it
        resetFoundForm();
        hideFoundReportForm();
        
        // Add the new item to the list (in a real app, this would come from the server)
        const newItem = {
            id: sampleFoundItems.length + 101,
            title: document.getElementById('found-item-title').value,
            category: document.getElementById('found-item-category').value,
            description: document.getElementById('found-item-description').value,
            location: document.getElementById('found-item-location').value,
            date: document.getElementById('found-item-date').value,
            contact: document.getElementById('found-contact-email').value,
            storage: document.getElementById('storage-location').value,
            image: null, // In a real app, you would upload the image
            status: 'found'
        };
        
        sampleFoundItems.unshift(newItem);
        displayFoundItems(sampleFoundItems);
    }
}

// Validate form inputs
function validateForm(formType) {
    let isValid = true;
    const prefix = formType === 'lost' ? '' : 'found-';
    
    hideAllErrors(formType);
    
    // Title validation
    if (!document.getElementById(`${prefix}item-title`).value.trim()) {
        document.getElementById(`${prefix}title-error`).style.display = 'block';
        isValid = false;
    }
    
    // Category validation
    if (!document.getElementById(`${prefix}item-category`).value) {
        document.getElementById(`${prefix}category-error`).style.display = 'block';
        isValid = false;
    }
    
    // Description validation
    if (!document.getElementById(`${prefix}item-description`).value.trim()) {
        document.getElementById(`${prefix}description-error`).style.display = 'block';
        isValid = false;
    }
    
    // Location validation
    if (!document.getElementById(`${prefix}item-location`).value.trim()) {
        document.getElementById(`${prefix}location-error`).style.display = 'block';
        isValid = false;
    }
    
    // Date validation
    if (!document.getElementById(`${prefix}item-date`).value) {
        document.getElementById(`${prefix}date-error`).style.display = 'block';
        isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailField = formType === 'lost' ? 'contact-email' : 'found-contact-email';
    if (!emailRegex.test(document.getElementById(emailField).value)) {
        document.getElementById(`${prefix}email-error`).style.display = 'block';
        isValid = false;
    }
    
    // Storage location validation for found items
    if (formType === 'found' && !document.getElementById('storage-location').value.trim()) {
        document.getElementById('storage-error').style.display = 'block';
        isValid = false;
    }
    
    return isValid;
}

// Handle image upload
function handleImageUpload(e, previewImg, imagePreview, imageUpload) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            previewImg.src = event.target.result;
            imagePreview.style.display = 'block';
            imageUpload.style.display = 'none';
        };
        
        reader.readAsDataURL(file);
    }
}

// Remove uploaded image
function removeImage(itemImage, imagePreview, imageUpload) {
    itemImage.value = '';
    imagePreview.style.display = 'none';
    imageUpload.style.display = 'block';
}

// Perform search across both lost and found items
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        displayLostItems(sampleLostItems);
        displayFoundItems(sampleFoundItems);
        return;
    }
    
    const filteredLostItems = sampleLostItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    
    const filteredFoundItems = sampleFoundItems.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.location.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
    
    displayLostItems(filteredLostItems);
    displayFoundItems(filteredFoundItems);
}

// Close success modal
function closeSuccessModal() {
    successModal.style.display = 'none';
}