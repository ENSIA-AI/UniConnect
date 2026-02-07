const itemsGrid = document.getElementById('itemsGrid');
const searchInput = document.getElementById('searchInput');

document.addEventListener('DOMContentLoaded', async () => {
    await loadMarketplaceItems();
    setupSearch();
});

async function loadMarketplaceItems() {
    try {
        const items = await apiCall(API_ENDPOINTS.MARKETPLACE.GET_ALL);
        
        itemsGrid.innerHTML = '';
        
        if (items.length === 0) {
            itemsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 15px; display: block; color: #7C3AED;"></i>
                    <h3>No items available</h3>
                    <p>Be the first to list an item!</p>
                </div>
            `;
            return;
        }
        
        items.forEach(item => createItemCard(item));
    } catch (error) {
        console.error('Error loading marketplace items:', error);
        itemsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #dc3545;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <h3>Error loading items</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.classList.add('item-card');
    card.dataset.title = item.title;
    card.dataset.desc = item.description;
    card.dataset.price = item.price + ' DA';
    card.dataset.img = item.image_url || 'https://via.placeholder.com/400x300?text=No+Image';
    card.dataset.email = item.seller_email;
    card.dataset.id = item.id;

    card.innerHTML = `
        <div class="img-box">
            <img src="${item.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${item.title}">
        </div>
        <div class="info">
            <div class="title">${escapeHtml(item.title)}</div>
            <div class="sub">${escapeHtml(item.seller_email)}</div>
            <div class="price">${item.price} DA</div>
        </div>
    `;
    
    itemsGrid.appendChild(card);
}

function setupSearch() {
    searchInput.addEventListener('input', async () => {
        const value = searchInput.value.toLowerCase().trim();
        
        if (!value) {
            await loadMarketplaceItems();
            return;
        }
        
        try {
            const items = await apiCall(API_ENDPOINTS.MARKETPLACE.SEARCH(value));
            
            itemsGrid.innerHTML = '';
            
            if (items.length === 0) {
                itemsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                        No items found matching "${value}"
                    </div>
                `;
                return;
            }
            
            items.forEach(item => createItemCard(item));
        } catch (error) {
            console.error('Error searching items:', error);
        }
    });
}

// Popup functionality
itemsGrid.addEventListener('click', e => {
    const card = e.target.closest('.item-card');
    if (!card) return;

    const popup = document.createElement('div');
    popup.classList.add('popup-overlay');

    const box = document.createElement('div');
    box.classList.add('popup-box');

    const left = document.createElement('div');
    left.classList.add('popup-left');

    const img = document.createElement('img');
    img.src = card.dataset.img;
    img.alt = card.dataset.title;

    const title = document.createElement('div');
    title.classList.add('title');
    title.innerText = card.dataset.title;

    const price = document.createElement('div');
    price.classList.add('price');
    price.innerText = card.dataset.price;

    const email = document.createElement('div');
    email.classList.add('email');
    email.innerText = card.dataset.email;

    left.append(img, title, price, email);

    const right = document.createElement('div');
    right.classList.add('popup-right');
    right.innerText = card.dataset.desc;

    box.append(left, right);
    popup.appendChild(box);
    document.body.appendChild(popup);

    popup.addEventListener('click', event => {
        if (event.target === popup) popup.remove();
    });
});

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