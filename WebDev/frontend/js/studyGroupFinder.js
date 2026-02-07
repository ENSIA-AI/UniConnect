document.addEventListener('DOMContentLoaded', async function() {
    const studyGroupForm = document.getElementById('studyGroupForm');
    const timeSlots = document.querySelectorAll('.time-option');
    const groupsContainer = document.getElementById('groupsContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
        return;
    }
    
    // Auto-fill contact email with current user's email
    const contactInput = document.getElementById('contact');
    if (contactInput && currentUser.email) {
        contactInput.value = currentUser.email;
        contactInput.readOnly = true;
    }
    
    let selectedTimes = [];

    await loadStudyGroups();

    // Time slot selection
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            this.classList.toggle('selected');
            const time = this.textContent;
            
            if (this.classList.contains('selected')) {
                selectedTimes.push(time);
            } else {
                selectedTimes = selectedTimes.filter(t => t !== time);
            }
        });
    });

    // Form submission
    studyGroupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const module = document.getElementById('module').value;
        const phone = document.getElementById('phone').value;
        const notes = document.getElementById('notes').value;
        
        if (!module || !notes) {
            alert('Please fill in all required fields');
            return;
        }

        if (selectedTimes.length === 0) {
            alert('Please select at least one preferred time slot');
            return;
        }

        try {
            const groupData = {
                module_name: module,
                contact_email: currentUser.email, // Use authenticated user's email
                contact_phone: phone,
                notes: notes,
                preferred_times: selectedTimes
            };

            await apiCall(API_ENDPOINTS.STUDY_GROUPS.CREATE, {
                method: 'POST',
                body: JSON.stringify(groupData)
            });

            showNotification('Study group created successfully!', 'success');
            
            studyGroupForm.reset();
            // Restore the contact email after reset
            if (contactInput && currentUser.email) {
                contactInput.value = currentUser.email;
            }
            selectedTimes = [];
            timeSlots.forEach(slot => slot.classList.remove('selected'));
            
            await loadStudyGroups();
        } catch (error) {
            showNotification('Failed to create study group: ' + error.message, 'error');
        }
    });

    // Search functionality
    searchInput.addEventListener('input', async function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        if (!searchTerm) {
            await loadStudyGroups();
            return;
        }
        
        try {
            const groups = await apiCall(API_ENDPOINTS.STUDY_GROUPS.SEARCH(searchTerm));
            renderStudyGroups(groups);
        } catch (error) {
            console.error('Search error:', error);
        }
    });

    async function loadStudyGroups() {
        try {
            const groups = await apiCall(API_ENDPOINTS.STUDY_GROUPS.GET_ALL);
            renderStudyGroups(groups);
        } catch (error) {
            console.error('Error loading study groups:', error);
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <h3>Error Loading Groups</h3>
                <p>${error.message}</p>
            `;
        }
    }

    function renderStudyGroups(groups) {
        groupsContainer.innerHTML = '';
        
        if (groups.length === 0) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <h3>No Study Groups Yet</h3>
                <p>Be the first to create a study group request!</p>
            `;
            return;
        }

        emptyState.style.display = 'none';

        groups.forEach(group => {
            const isOwnPost = group.user_id === currentUser.email;
            
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';
            
            const times = Array.isArray(group.preferred_times) ? 
                         group.preferred_times : JSON.parse(group.preferred_times || '[]');
            
            groupCard.innerHTML = `
                <div class="group-header">
                    <div class="module-name">${escapeHtml(group.module_name)}</div>
                    <div class="status-container">
                        <div class="status">${escapeHtml(group.status)}</div>
                        ${isOwnPost ? `
                            <button class="delete-btn" onclick="deleteStudyGroup(${group.id})" title="Delete this post">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="group-details">
                    <div class="detail">
                        <i class="fas fa-envelope"></i>
                        <span>${escapeHtml(group.contact_email)}</span>
                    </div>
                    ${group.contact_phone ? `
                    <div class="detail">
                        <i class="fas fa-phone"></i>
                        <span>${escapeHtml(group.contact_phone)}</span>
                    </div>
                    ` : ''}
                    <div class="detail">
                        <i class="fas fa-clock"></i>
                        <span>${times.join(', ')}</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-calendar"></i>
                        <span>Posted: ${formatDate(group.created_at)}</span>
                    </div>
                    ${isOwnPost ? `
                    <div class="detail owner-badge">
                        <i class="fas fa-user-check"></i>
                        <span>Your post</span>
                    </div>
                    ` : ''}
                </div>
                <div class="group-notes">
                    <strong>Study Focus:</strong> ${escapeHtml(group.notes)}
                </div>
            `;
            groupsContainer.appendChild(groupCard);
        });
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
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

    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: ${type === 'success' ? '#4bb543' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    window.deleteStudyGroup = async function(groupId) {
        if (!confirm('Are you sure you want to delete this study group?')) {
            return;
        }

        try {
            await apiCall(API_ENDPOINTS.STUDY_GROUPS.DELETE(groupId), {
                method: 'DELETE'
            });

            showNotification('Study group deleted successfully!', 'success');
            await loadStudyGroups();
        } catch (error) {
            showNotification('Failed to delete study group: ' + error.message, 'error');
        }
    };
});