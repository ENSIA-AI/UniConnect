// API URL 
const API_URL = "http://localhost/UniConnect/backend/api/studygroups.php";

// HARDCODED USER ID - Change this to YOUR user ID
const currentUserId = 7; // <-- SET YOUR USER ID HERE

console.log('🆔 Using user ID:', currentUserId);

document.addEventListener('DOMContentLoaded', () => {

    /* ================= SIDEBAR ================= */
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    /* ================= ELEMENTS ================= */
    const form = document.getElementById('studyGroupForm');
    const timeSlots = document.querySelectorAll('.time-option');
    const groupsContainer = document.getElementById('groupsContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');

    const moduleInput = document.getElementById('module');
    const emailInput = document.getElementById('contact');
    const phoneInput = document.getElementById('phone');
    const notesInput = document.getElementById('notes');

    /* ================= DATA ================= */
    let selectedTimes = [];
    let isEditing = false;
    let editingGroupId = null;

    const ensiaEmailRegex = /^[a-z]+\.[a-z]+@ensia\.edu\.dz$/;

    /* ================= TIME SLOTS ================= */
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            slot.classList.toggle('selected');
            const value = slot.textContent.trim();

            if (slot.classList.contains('selected')) {
                selectedTimes.push(value);
            } else {
                selectedTimes = selectedTimes.filter(t => t !== value);
            }
        });
    });

    /* ================= LOAD GROUPS ON START ================= */
    loadGroups();

    /* ================= FORM SUBMIT (CREATE/UPDATE) ================= */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const module = moduleInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const notes = notesInput.value.trim();

        if (!module || !email || !notes) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!ensiaEmailRegex.test(email)) {
            showNotification('Email must be firstname.lastname@ensia.edu.dz', 'error');
            return;
        }

        if (selectedTimes.length === 0) {
            showNotification('Please select at least one preferred time slot', 'error');
            return;
        }

        const groupData = {
            module_name: module,
            contact_email: email,
            contact_phone: phone,
            notes: notes,
            preferred_times: selectedTimes,
            user_id: currentUserId
        };

        try {
            let response;

            if (isEditing && editingGroupId) {
                // UPDATE
                response = await fetch(`${API_URL}?id=${editingGroupId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(groupData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update');
                }

                showNotification('Study group updated successfully!', 'success');
                cancelEdit();
            } else {
                // CREATE
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(groupData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to create');
                }

                showNotification('Study group created successfully!', 'success');
                form.reset();
                selectedTimes = [];
                timeSlots.forEach(t => t.classList.remove('selected'));
            }

            await loadGroups();

        } catch (error) {
            console.error('Error:', error);
            showNotification('Error: ' + error.message, 'error');
        }
    });

    /* ================= EDIT POST ================= */
    window.editPost = async function(id) {
        try {
            const response = await fetch(`${API_URL}?id=${id}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch group');

            const group = await response.json();

            moduleInput.value = group.module_name;
            emailInput.value = group.contact_email;
            phoneInput.value = group.contact_phone || '';
            notesInput.value = group.notes;

            selectedTimes = [];
            timeSlots.forEach(slot => slot.classList.remove('selected'));

            const times = Array.isArray(group.preferred_times) 
                ? group.preferred_times 
                : JSON.parse(group.preferred_times || '[]');

            times.forEach(time => {
                timeSlots.forEach(slot => {
                    if (slot.textContent.trim() === time) {
                        slot.classList.add('selected');
                        selectedTimes.push(time);
                    }
                });
            });

            isEditing = true;
            editingGroupId = id;

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Update Study Group';
            submitBtn.style.background = '#f59e0b';

            if (!document.getElementById('cancelEditBtn')) {
                const cancelBtn = document.createElement('button');
                cancelBtn.type = 'button';
                cancelBtn.id = 'cancelEditBtn';
                cancelBtn.className = 'btn';
                cancelBtn.textContent = 'Cancel Edit';
                cancelBtn.style.cssText = 'width: 100%; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 10px;';
                cancelBtn.onclick = cancelEdit;
                submitBtn.parentNode.appendChild(cancelBtn);
            }

            document.querySelector('.create-form').scrollIntoView({ behavior: 'smooth' });
            showNotification('Editing mode activated', 'success');

        } catch (error) {
            console.error('Edit error:', error);
            showNotification('Error loading group', 'error');
        }
    };

    /* ================= CANCEL EDIT ================= */
    function cancelEdit() {
        isEditing = false;
        editingGroupId = null;

        form.reset();
        selectedTimes = [];
        timeSlots.forEach(slot => slot.classList.remove('selected'));

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Post request';
        submitBtn.style.background = '#7C3AED';

        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) cancelBtn.remove();

        showNotification('Edit cancelled', 'success');
    }

    /* ================= DELETE POST ================= */
    window.deletePost = async function (id) {
        if (!confirm('Are you sure you want to delete this study group?')) return;

        try {
            const response = await fetch(`${API_URL}?id=${id}`, { 
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Delete failed');

            showNotification('Study group deleted successfully!', 'success');
            await loadGroups();

        } catch (error) {
            console.error('Delete error:', error);
            showNotification('Error deleting study group', 'error');
        }
    };

    /* ================= LOAD ALL GROUPS ================= */
    async function loadGroups() {
        try {
            const response = await fetch(API_URL, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to load groups');

            const data = await response.json();
            console.log('📦 Loaded groups:', data);
            renderGroups(data);

        } catch (error) {
            console.error('Load error:', error);
            showNotification('Error loading study groups', 'error');
        }
    }

    /* ================= SEARCH ================= */
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const term = searchInput.value.trim();
            term ? searchGroups(term) : loadGroups();
        }, 300);
    });

    async function searchGroups(term) {
        try {
            const response = await fetch(`${API_URL}?search=${encodeURIComponent(term)}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            renderGroups(data);

        } catch (error) {
            console.error('Search error:', error);
            showNotification('Error searching groups', 'error');
        }
    }

    /* ================= RENDER GROUPS ================= */
    function renderGroups(groups) {
        groupsContainer.innerHTML = '';

        if (!groups || groups.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        groups.forEach(group => {
            // Convert both to numbers for proper comparison
            const groupUserId = parseInt(group.user_id);
            const isOwner = (groupUserId === currentUserId);
            
            console.log(`🔍 Group "${group.module_name}": user_id=${groupUserId}, currentUserId=${currentUserId}, isOwner=${isOwner}`);
            
            const times = Array.isArray(group.preferred_times)
                ? group.preferred_times
                : (typeof group.preferred_times === 'string' 
                    ? JSON.parse(group.preferred_times || '[]')
                    : []);

            const card = document.createElement('div');
            card.className = 'group-card';
            
            card.innerHTML = `
                <div class="group-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
                    <div class="module-name">${escapeHtml(group.module_name)}</div>
                    ${isOwner ? `
                        <div style="display:flex;gap:12px;align-items:center;">
                            <button onclick="editPost(${group.id})" 
                                style="background:none;border:none;color:#f59e0b;cursor:pointer;font-size:1.2rem;padding:5px;transition:transform 0.2s;"
                                onmouseover="this.style.transform='scale(1.2)'"
                                onmouseout="this.style.transform='scale(1)'"
                                title="Edit this study group">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deletePost(${group.id})" 
                                style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:1.2rem;padding:5px;transition:transform 0.2s;"
                                onmouseover="this.style.transform='scale(1.2)'"
                                onmouseout="this.style.transform='scale(1)'"
                                title="Delete this study group">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                
                <div class="detail" style="margin:8px 0;">
                    <i class="fas fa-envelope" style="width:20px;color:#7C3AED;"></i> 
                    ${escapeHtml(group.contact_email)}
                </div>
                
                ${group.contact_phone ? `
                    <div class="detail" style="margin:8px 0;">
                        <i class="fas fa-phone" style="width:20px;color:#7C3AED;"></i> 
                        ${escapeHtml(group.contact_phone)}
                    </div>
                ` : ''}
                
                <div class="detail" style="margin:8px 0;">
                    <i class="fas fa-clock" style="width:20px;color:#7C3AED;"></i> 
                    ${times.join(', ')}
                </div>
                
                <div class="detail" style="margin:8px 0;">
                    <i class="fas fa-calendar" style="width:20px;color:#7C3AED;"></i> 
                    Posted: ${formatDate(group.created_at)}
                </div>
                
                <div class="group-notes">
                    <strong>Study Focus:</strong> ${escapeHtml(group.notes)}
                </div>
            `;
            
            groupsContainer.appendChild(card);
        });
    }

    /* ================= HELPER FUNCTIONS ================= */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4bb543' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 2000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            transform: translateX(120%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.style.transform = 'translateX(0)', 10);
        setTimeout(() => {
            notification.style.transform = 'translateX(120%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});