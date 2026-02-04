document.addEventListener('DOMContentLoaded', () => {

    /* ================= SIDEBAR ================= */
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

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
    const currentUserId = 'user123';
    let selectedTimes = [];
    let studyGroups = [];

    const ensiaEmailRegex = /^[a-z]+\.[a-z]+@ensia\.edu\.dz$/;

    /* ================= TIME SLOTS ================= */
    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            slot.classList.toggle('selected');
            const value = slot.textContent;

            if (slot.classList.contains('selected')) {
                selectedTimes.push(value);
            } else {
                selectedTimes = selectedTimes.filter(t => t !== value);
            }
        });
    });

    /* ================= FORM SUBMIT ================= */
    form.addEventListener('submit', e => {
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
            showNotification(
                'Email must be in the form firstname.lastname@ensia.edu.dz',
                'error'
            );
            return;
        }

        if (selectedTimes.length === 0) {
            showNotification('Please select at least one preferred time slot', 'error');
            return;
        }

        const newGroup = {
            id: Date.now(),
            module,
            email,
            phone,
            notes,
            times: [...selectedTimes],
            date: new Date().toLocaleDateString(),
            userId: currentUserId
        };

        studyGroups.unshift(newGroup);
        renderGroups(searchInput.value.toLowerCase());

        // Reset form
        form.reset();
        selectedTimes = [];
        timeSlots.forEach(t => t.classList.remove('selected'));

        showNotification('Study group created successfully!', 'success');
    });

    /* ================= SEARCH (FIXED) ================= */
    searchInput.addEventListener('input', () => {
        renderGroups(searchInput.value.toLowerCase());
    });

    /* ================= DELETE ================= */
    window.deletePost = function (id) {
        studyGroups = studyGroups.filter(g => g.id !== id);
        renderGroups(searchInput.value.toLowerCase());
        showNotification('Study group deleted successfully!', 'success');
    };

    /* ================= RENDER (FIXED) ================= */
    function renderGroups(search = '') {
        // Remove ONLY existing cards
        groupsContainer.querySelectorAll('.group-card').forEach(card => card.remove());

        const filtered = studyGroups.filter(g =>
            g.module.toLowerCase().includes(search) ||
            g.notes.toLowerCase().includes(search) ||
            g.email.toLowerCase().includes(search)
        );

        if (filtered.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filtered.forEach(group => {
            const isOwner = group.userId === currentUserId;

            const card = document.createElement('div');
            card.className = 'group-card';

            card.innerHTML = `
                <div class="group-header" style="display:flex;justify-content:space-between;align-items:center;">
                    <div class="module-name">${group.module}</div>
                    ${isOwner ? `
                        <button onclick="deletePost(${group.id})"
                            style="background:none;border:none;color:#dc3545;cursor:pointer;font-size:1.1rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>

                <div class="detail"><i class="fas fa-envelope"></i> ${group.email}</div>
                ${group.phone ? `<div class="detail"><i class="fas fa-phone"></i> ${group.phone}</div>` : ''}
                <div class="detail"><i class="fas fa-clock"></i> ${group.times.join(', ')}</div>
                <div class="detail"><i class="fas fa-calendar"></i> Posted: ${group.date}</div>

                <div class="group-notes">
                    <strong>Study Focus:</strong> ${group.notes}
                </div>
            `;

            groupsContainer.appendChild(card);
        });
    }

    /* ================= NOTIFICATION ================= */
    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'notification';
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
