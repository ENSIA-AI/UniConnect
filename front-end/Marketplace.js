const container = document.getElementById("marketplace-items");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("itemModal");

async function fetchMarketplace() {
    try {
        const res = await fetch('http://localhost/UniConnect/backend/api/marketplace.php');
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const items = await res.json();
        
        console.log("Fetched items:", items);

        displayItems(items);
    } catch (err) {
        console.error("Error fetching marketplace:", err);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6B7280;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <p style="font-size: 1.1rem;">Error loading items: ${err.message}</p>
            </div>
        `;
    }
}

function displayItems(items) {
    container.innerHTML = "";
    
    if (!items || items.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6B7280;">
                <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <p style="font-size: 1.1rem;">No items found in the marketplace.</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item-card");
        
        const imagePath = item.image_url 
            ? `http://localhost/UniConnect/backend/${item.image_url}` 
            : 'https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=No+Image';
        
        div.innerHTML = `
            <div class="item-actions">
                <button class="action-btn edit-btn" onclick="openEditModal(${item.id}, event)" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="confirmDelete(${item.id}, event)" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="img-box">
                <img src="${imagePath}" alt="${item.title}" 
                     onerror="this.src='https://via.placeholder.com/300x200/7C3AED/FFFFFF?text=No+Image'" />
            </div>
            <div class="info">
                <div class="title">${item.title}</div>
                <div class="price">${parseFloat(item.price).toFixed(2)} DA</div>
                <div class="sub"><i class="fas fa-tag"></i> ${item.status}</div>
            </div>
        `;
        
        // Store item data on the element for edit modal
        div.dataset.itemId = item.id;
        div.dataset.itemData = JSON.stringify(item);
        
        // Add click event to open modal (except when clicking action buttons)
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.item-actions')) {
                openModal(item);
            }
        });
        
        container.appendChild(div);
    });
}

function openModal(item) {
    const imagePath = item.image_url 
        ? `http://localhost/UniConnect/backend/${item.image_url}` 
        : 'https://via.placeholder.com/500x400/7C3AED/FFFFFF?text=No+Image';
    
    modal.innerHTML = `
        <div class="modal-box">
            <button class="modal-close" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-left">
                <img src="${imagePath}" alt="${item.title}" 
                     onerror="this.src='https://via.placeholder.com/500x400/7C3AED/FFFFFF?text=No+Image'" />
            </div>
            <div class="modal-right">
                <div class="modal-header">
                    <div class="modal-title">${item.title}</div>
                    <div class="modal-price">${parseFloat(item.price).toFixed(2)} DA</div>
                </div>
                
                <div class="modal-section">
                    <div class="modal-label"><i class="fas fa-align-left"></i> Description</div>
                    <div class="modal-description">${item.description}</div>
                </div>
                
                <div class="modal-section">
                    <div class="modal-label"><i class="fas fa-envelope"></i> Seller Contact</div>
                    <div class="modal-email">
                        <i class="fas fa-user"></i>
                        ${item.seller_email}
                    </div>
                </div>
                
                <div class="modal-section">
                    <div class="modal-label"><i class="fas fa-info-circle"></i> Status</div>
                    <div class="modal-description" style="color: #7C3AED; font-weight: 700; text-transform: capitalize;">
                        <i class="fas fa-tag"></i> ${item.status}
                    </div>
                </div>

                <div class="modal-section">
                    <div class="modal-label"><i class="fas fa-clock"></i> Posted</div>
                    <div class="modal-description" style="color: #6B7280; font-weight: 600;">
                        ${new Date(item.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function openEditModal(id, event) {
    event.stopPropagation();
    
    // Get item data from the card
    const card = event.target.closest('.item-card');
    const item = JSON.parse(card.dataset.itemData);
    
    const imagePath = item.image_url 
        ? `http://localhost/UniConnect/backend/${item.image_url}` 
        : '';
    
    modal.innerHTML = `
        <div class="modal-box" style="max-width: 600px;">
            <button class="modal-close" onclick="closeModal()">
                <i class="fas fa-times"></i>
            </button>
            <div class="modal-right" style="padding: 30px; width: 100%;">
                <h2 style="color: #4C1D95; font-size: 1.8rem; margin-bottom: 25px; text-align: center;">
                    <i class="fas fa-edit"></i> Edit Item
                </h2>
                
                <form id="editForm" onsubmit="updateItem(event, ${id})">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #4C1D95; font-weight: 700; margin-bottom: 8px;">Item Name *</label>
                        <input type="text" id="editTitle" value="${item.title}" required
                               style="width: 100%; padding: 12px; border: 2px solid #E9D5FF; border-radius: 12px; font-size: 1rem;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #4C1D95; font-weight: 700; margin-bottom: 8px;">Price (DA) *</label>
                        <input type="number" id="editPrice" value="${item.price}" step="0.01" required
                               style="width: 100%; padding: 12px; border: 2px solid #E9D5FF; border-radius: 12px; font-size: 1rem;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #4C1D95; font-weight: 700; margin-bottom: 8px;">Description *</label>
                        <textarea id="editDescription" required
                                  style="width: 100%; padding: 12px; border: 2px solid #E9D5FF; border-radius: 12px; font-size: 1rem; min-height: 100px; resize: vertical;">${item.description}</textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #4C1D95; font-weight: 700; margin-bottom: 8px;">Status</label>
                        <select id="editStatus" 
                                style="width: 100%; padding: 12px; border: 2px solid #E9D5FF; border-radius: 12px; font-size: 1rem;">
                            <option value="available" ${item.status === 'available' ? 'selected' : ''}>Available</option>
                            <option value="reserved" ${item.status === 'reserved' ? 'selected' : ''}>Reserved</option>
                            <option value="sold" ${item.status === 'sold' ? 'selected' : ''}>Sold</option>
                        </select>
                    </div>
                    
                    <input type="hidden" id="editImageUrl" value="${imagePath}">
                    
                    <div style="display: flex; gap: 15px; margin-top: 30px;">
                        <button type="button" onclick="closeModal()" 
                                style="flex: 1; padding: 14px; background: #E5E7EB; color: #374151; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" 
                                style="flex: 1; padding: 14px; background: #8B5CF6; color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

async function updateItem(event, id) {
    event.preventDefault();
    
    const title = document.getElementById('editTitle').value.trim();
    const price = document.getElementById('editPrice').value;
    const description = document.getElementById('editDescription').value.trim();
    const status = document.getElementById('editStatus').value;
    const imageUrl = document.getElementById('editImageUrl').value;
    
    try {
        const response = await fetch('http://localhost/UniConnect/backend/api/marketplace.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}&title=${encodeURIComponent(title)}&price=${price}&description=${encodeURIComponent(description)}&status=${status}&image_url=${encodeURIComponent(imageUrl)}`
        });

        const data = await response.json();

        if (data.success) {
            closeModal();
            
            // Show success message
            showSuccessMessage('Item updated successfully!');
            
            // Refresh the marketplace
            fetchMarketplace();
        } else {
            showErrorMessage('Failed to update item: ' + data.message);
        }
    } catch (error) {
        console.error('Update error:', error);
        showErrorMessage('Error updating item: ' + error.message);
    }
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
        closeModal();
    }
});

function confirmDelete(id, event) {
    event.stopPropagation();
    
    modal.innerHTML = `
        <div class="delete-modal">
            <div class="delete-modal-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3>Delete Item?</h3>
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div class="delete-modal-actions">
                <button class="modal-btn cancel-btn" onclick="closeModal()">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="modal-btn confirm-delete-btn" onclick="deleteItem(${id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

async function deleteItem(id) {
    try {
        const res = await fetch('http://localhost/UniConnect/backend/api/marketplace.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${id}`
        });

        const data = await res.json();
        
        if(data.success) {
            closeModal();
            showSuccessMessage('Item deleted successfully!');
            fetchMarketplace();
        } else {
            showErrorMessage('Delete failed: ' + data.message);
        }
    } catch (err) {
        console.error("Delete error:", err);
        showErrorMessage('Error deleting item: ' + err.message);
    }
}

function showSuccessMessage(message) {
    const successMsg = document.createElement('div');
    successMsg.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: #10B981;
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        font-weight: 700;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    successMsg.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

function showErrorMessage(message) {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: #DC2626;
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        font-weight: 700;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        errorMsg.remove();
    }, 3000);
}

// Search functionality
if (searchInput) {
    searchInput.addEventListener('input', async function() {
        const searchTerm = this.value.trim();
        
        if (searchTerm === '') {
            fetchMarketplace();
            return;
        }
        
        try {
            const res = await fetch(`http://localhost/UniConnect/backend/api/marketplace.php?search=${encodeURIComponent(searchTerm)}`);
            const items = await res.json();
            displayItems(items);
        } catch (err) {
            console.error("Search error:", err);
        }
    });
}

function logout() {
    if(confirm('Are you sure you want to log out?')) {
        window.location.href = 'index.html';
    }
}

// Load items when page loads
document.addEventListener('DOMContentLoaded', fetchMarketplace);