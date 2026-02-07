// API URL
const API_URL = "http://localhost/UniConnect/backend/api/studygroups.php";

// HARDCODED USER ID (for now)
const currentUserId = 7;

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

    /* ================= LOAD GROUPS ================= */
    loadGroups();

    /* ================= FORM SUBMIT ================= */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const groupData = {
            module_name: moduleInput.value.trim(),
            contact_email: emailInput.value.trim(),
            contact_phone: phoneInput.value.trim(),
            notes: notesInput.value.trim(),
            preferred_times: selectedTimes,
            user_id: currentUserId
        };

        if (!groupData.module_name || !groupData.contact_email || !groupData.notes) {
            return showNotification('Please fill in all required fields', 'error');
        }

        if (!ensiaEmailRegex.test(groupData.contact_email)) {
            return showNotification('Invalid ENSIA email format', 'error');
        }

        if (selectedTimes.length === 0) {
            return showNotification('Select at least one time slot', 'error');
        }

        try {
            const response = await fetch(
                isEditing ? `${API_URL}?id=${editingGroupId}` : API_URL,
                {
                    method: isEditing ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(groupData)
                }
            );

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            showNotification(isEditing ? 'Updated successfully!' : 'Created successfully!');
            cancelEdit();
            await loadGroups();

        } catch (err) {
            showNotification(err.message, 'error');
        }
    });

    /* ================= LOAD ================= */
    async function loadGroups() {
        const res = await fetch(API_URL, { credentials: 'include' });
        const data = await res.json();
        renderGroups(data);
    }

    /* ================= SEARCH ================= */
    searchInput.addEventListener('input', async () => {
        const term = searchInput.value.trim();
        const res = await fetch(`${API_URL}?search=${encodeURIComponent(term)}`, {
            credentials: 'include'
        });
        renderGroups(await res.json());
    });

    /* ================= RENDER ================= */
    function renderGroups(groups) {
        groupsContainer.innerHTML = '';

        if (!groups.length) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        groups.forEach(group => {
            const isOwner = parseInt(group.user_id) === currentUserId;
            const times = group.preferred_times || [];

            const card = document.createElement('div');
            card.className = 'group-card';

            card.innerHTML = `
                <h3>${escapeHtml(group.module_name)}</h3>
                <p>📧 ${escapeHtml(group.contact_email)}</p>
                <p>⏰ ${times.join(', ')}</p>
                <p>${escapeHtml(group.notes)}</p>
                ${isOwner ? `
                    <button onclick="editPost(${group.id})">✏️</button>
                    <button onclick="deletePost(${group.id})">🗑️</button>
                ` : ''}
            `;

            groupsContainer.appendChild(card);
        });
    }

    /* ================= HELPERS ================= */
    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    function showNotification(msg, type = 'success') {
        alert(msg);
    }

    window.deletePost = async id => {
        if (!confirm('Delete this group?')) return;
        await fetch(`${API_URL}?id=${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        loadGroups();
    };

    window.editPost = async id => {
        const res = await fetch(`${API_URL}?id=${id}`, { credentials: 'include' });
        const g = await res.json();

        moduleInput.value = g.module_name;
        emailInput.value = g.contact_email;
        phoneInput.value = g.contact_phone;
        notesInput.value = g.notes;

        selectedTimes = g.preferred_times || [];
        timeSlots.forEach(s => {
            s.classList.toggle('selected', selectedTimes.includes(s.textContent.trim()));
        });

        isEditing = true;
        editingGroupId = id;
    };

    function cancelEdit() {
        isEditing = false;
        editingGroupId = null;
        form.reset();
        selectedTimes = [];
        timeSlots.forEach(s => s.classList.remove('selected'));
    }
});
