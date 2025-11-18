// studyGroupFinder.js

document.addEventListener('DOMContentLoaded', function() {
    const studyGroupForm = document.getElementById('studyGroupForm');
    const timeSlots = document.querySelectorAll('.time-option');
    const groupsContainer = document.getElementById('groupsContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    
    // Sample user ID - in a real app this would come from authentication
    const currentUserId = 'user123';
    
    let studyGroups = [];
    let selectedTimes = [];

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
    studyGroupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const module = document.getElementById('module').value;
        const contact = document.getElementById('contact').value;
        const phone = document.getElementById('phone').value;
        const notes = document.getElementById('notes').value;
        
        if (!module || !contact || !notes) {
            alert('Please fill in all required fields');
            return;
        }

        if (selectedTimes.length === 0) {
            alert('Please select at least one preferred time slot');
            return;
        }

        const newGroup = {
            id: Date.now(),
            module: module,
            contact: contact,
            phone: phone,
            notes: notes,
            times: [...selectedTimes],
            status: 'Looking for members',
            date: new Date().toLocaleDateString(),
            userId: currentUserId
        };

        studyGroups.unshift(newGroup);
        renderStudyGroups();
        studyGroupForm.reset();
        selectedTimes = [];
        timeSlots.forEach(slot => slot.classList.remove('selected'));
        
        // Show success message
        showNotification('Study group created successfully!', 'success');
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        renderStudyGroups(this.value.toLowerCase());
    });

    // Delete post function with beautiful modal
    function deletePost(postId) {
        showDeleteModal(postId);
    }

    // Show delete confirmation modal
    function showDeleteModal(postId) {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'delete-modal';
        modal.style.cssText = `
            background-color: white;
            border-radius: 12px;
            width: 450px;
            max-width: 90%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;

        modal.innerHTML = `
            <div class="modal-header" style="padding: 20px 25px; border-bottom: 1px solid #eee; display: flex; align-items: center;">
                <div class="modal-icon" style="width: 50px; height: 50px; border-radius: 50%; background-color: #ffeaea; color: #dc3545; display: flex; justify-content: center; align-items: center; margin-right: 15px; font-size: 24px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="modal-title" style="font-size: 20px; font-weight: 600; color: #1E1B4B;">Delete Study Group</h3>
            </div>
            <div class="modal-body" style="padding: 25px;">
                <p class="modal-message" style="color: #6c757d; line-height: 1.6; margin-bottom: 20px;">
                    Are you sure you want to delete this study group post? This action cannot be undone and all associated data will be permanently removed.
                </p>
            </div>
            <div class="modal-footer" style="padding: 15px 25px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px;">
                <button class="btn btn-cancel" style="padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; border: 1px solid #ddd; background-color: #f8f9fa; color: #6c757d;">Cancel</button>
                <button class="btn btn-confirm" style="padding: 10px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; border: none; background-color: #dc3545; color: white;">Delete</button>
            </div>
        `;

        modalOverlay.appendChild(modal);
        document.body.appendChild(modalOverlay);

        // Add event listeners
        const cancelBtn = modal.querySelector('.btn-cancel');
        const confirmBtn = modal.querySelector('.btn-confirm');

        function closeModal() {
            modalOverlay.style.opacity = '0';
            modalOverlay.style.visibility = 'hidden';
            modal.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                if (modalOverlay.parentNode) {
                    modalOverlay.parentNode.removeChild(modalOverlay);
                }
            }, 300);
        }

        cancelBtn.addEventListener('click', closeModal);
        
        confirmBtn.addEventListener('click', function() {
            studyGroups = studyGroups.filter(group => group.id !== postId);
            renderStudyGroups(searchInput.value.toLowerCase());
            closeModal();
            showNotification('Study group deleted successfully!', 'success');
        });

        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Show modal with animation
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalOverlay.style.visibility = 'visible';
            modal.style.transform = 'translateY(0)';
        }, 10);
    }

    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notification
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

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Render study groups
    function renderStudyGroups(searchTerm = '') {
        groupsContainer.innerHTML = '';
        
        const filteredGroups = searchTerm ? 
            studyGroups.filter(group => 
                group.module.toLowerCase().includes(searchTerm) ||
                group.notes.toLowerCase().includes(searchTerm) ||
                group.contact.toLowerCase().includes(searchTerm)
            ) : studyGroups;

        if (filteredGroups.length === 0) {
            emptyState.style.display = 'block';
            
            // Update empty state message based on search
            if (searchTerm) {
                emptyState.innerHTML = `
                    <h3>No Study Groups Found</h3>
                    <p>No study groups match your search for "${searchTerm}"</p>
                    <p>Try different keywords or create a new study group!</p>
                `;
            } else {
                emptyState.innerHTML = `
                    <h3>No Study Groups Yet</h3>
                    <p>Be the first to create a study group request!</p>
                `;
            }
        } else {
            emptyState.style.display = 'none';

            filteredGroups.forEach(group => {
                const groupCard = document.createElement('div');
                groupCard.className = 'group-card';
                
                // Check if current user owns this post
                const isOwnPost = group.userId === currentUserId;
                
                groupCard.innerHTML = `
                    <div class="group-header">
                        <div class="module-name">${group.module}</div>
                        <div class="status-container">
                            <div class="status">${group.status}</div>
                            ${isOwnPost ? `
                                <button class="delete-btn" onclick="deletePost(${group.id})" title="Delete this post">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="group-details">
                        <div class="detail">
                            <i class="fas fa-envelope"></i>
                            <span>${group.contact}</span>
                        </div>
                        ${group.phone ? `
                        <div class="detail">
                            <i class="fas fa-phone"></i>
                            <span>${group.phone}</span>
                        </div>
                        ` : ''}
                        <div class="detail">
                            <i class="fas fa-clock"></i>
                            <span>${group.times.join(', ')}</span>
                        </div>
                        <div class="detail">
                            <i class="fas fa-calendar"></i>
                            <span>Posted: ${group.date}</span>
                        </div>
                        ${isOwnPost ? `
                        <div class="detail owner-badge">
                            <i class="fas fa-user-check"></i>
                            <span>Your post</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="group-notes">
                        <strong>Study Focus:</strong> ${group.notes}
                    </div>
                `;
                groupsContainer.appendChild(groupCard);
            });
        }
    }

    // Make deletePost function available globally
    window.deletePost = deletePost;

    // Initialize with sample data and render
    addSampleData();
    renderStudyGroups();
});