document.addEventListener('DOMContentLoaded', async function() {
    const searchInput = document.getElementById('searchInput');
    const itemsGrid = document.getElementById('itemsGrid');
    
    await loadModules();
    
    async function loadModules() {
        try {
            const modules = await apiCall(API_ENDPOINTS.MODULES.GET_ALL);
            
            // Clear existing content
            itemsGrid.innerHTML = '';
            
            if (modules.length === 0) {
                itemsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #6c757d;">
                        <i class="fas fa-book-open" style="font-size: 3rem; margin-bottom: 15px; display: block; color: #7C3AED;"></i>
                        <h3>No modules available yet</h3>
                        <p>Be the first to add a module!</p>
                    </div>
                `;
                return;
            }
            
            modules.forEach(module => {
                addModuleCard(module);
            });
        } catch (error) {
            console.error('Error loading modules:', error);
            itemsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #dc3545;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                    <h3>Error loading modules</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    function addModuleCard(module) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.style.cursor = 'pointer';
        card.dataset.moduleId = module.id;
        
        const imageUrl = module.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop';
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const isOwner = currentUser && currentUser.email === module.owner_email;
        
        card.innerHTML = `
            <div class="img-box">
                <img src="${imageUrl}" alt="Module" onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'">
                <div class="overlay">
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
            <div class="info">
                <div class="title">Module: ${escapeHtml(module.module_name)}</div>
                <div class="sub"><i class="fas fa-calendar-alt"></i> ${escapeHtml(module.semester)} · Coefficient: ${module.coefficient}</div>
                <div class="owner-email"><i class="fas fa-user"></i> ${escapeHtml(module.owner_email)}</div>
                <div class="resources-count">
                    <i class="fas fa-file-alt"></i> ${module.resources_count || 0} Resources Available
                </div>
                ${isOwner ? `
                    <div class="action-buttons">
                        <button class="btn-delete" onclick="deleteModule(${module.id}, event)">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add click event to open module link
        card.addEventListener('click', function(e) {
            // Don't navigate if clicking delete button
            if (!e.target.closest('.btn-delete')) {
                window.open(module.module_link, '_blank');
            }
        });
        
        itemsGrid.appendChild(card);
    }
    
    // Search functionality
    searchInput.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (!searchTerm) {
            await loadModules();
            return;
        }
        
        const allCards = itemsGrid.querySelectorAll('.item-card');
        let visibleCount = 0;
        
        allCards.forEach(card => {
            const title = card.querySelector('.title').textContent.toLowerCase();
            const sub = card.querySelector('.sub').textContent.toLowerCase();
            const email = card.querySelector('.owner-email').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || sub.includes(searchTerm) || email.includes(searchTerm)) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show "no results" message if needed
        let noResultsMsg = document.getElementById('noResultsMsg');
        if (visibleCount === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'noResultsMsg';
                noResultsMsg.style.cssText = `
                    text-align: center;
                    padding: 40px;
                    color: #6c757d;
                    font-size: 1.1rem;
                    grid-column: 1 / -1;
                `;
                noResultsMsg.innerHTML = '<i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>No modules found matching your search.';
                itemsGrid.appendChild(noResultsMsg);
            }
        } else {
            if (noResultsMsg) {
                noResultsMsg.remove();
            }
        }
    });
    
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
});

// Global delete function
async function deleteModule(moduleId, event) {
    event.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this module?')) {
        return;
    }
    
    try {
        await apiCall(API_ENDPOINTS.MODULES.DELETE(moduleId), {
            method: 'DELETE'
        });
        
        // Reload modules
        location.reload();
    } catch (error) {
        alert('Failed to delete module: ' + error.message);
    }
}