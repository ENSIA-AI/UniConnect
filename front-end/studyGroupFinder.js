// Study Group Finder JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const studyGroupForm = document.getElementById('studyGroupForm');
    const timeSlots = document.querySelectorAll('.time-option');
    const groupsContainer = document.getElementById('groupsContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    
    let studyGroups = [];
    let selectedTimes = [];

    // Time slot selection
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            this.classList.toggle('selected');
            const time = this.textContent;
            
            if (this.classList.contains('selected')) {
                if (!selectedTimes.includes(time)) {
                    selectedTimes.push(time);
                }
            } else {
                selectedTimes = selectedTimes.filter(t => t !== time);
            }
        });
    });

    // Form submission
    if (studyGroupForm) {
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

            const newGroup = {
                id: Date.now(),
                module: module,
                contact: contact,
                phone: phone,
                notes: notes,
                times: [...selectedTimes],
                status: 'Looking for members',
                date: new Date().toLocaleDateString()
            };

            studyGroups.unshift(newGroup);
            renderStudyGroups();
            studyGroupForm.reset();
            selectedTimes = [];
            timeSlots.forEach(slot => slot.classList.remove('selected'));
            
            // Hide empty state
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderStudyGroups(this.value.toLowerCase());
        });
    }

    // Render study groups
    function renderStudyGroups(searchTerm = '') {
        if (!groupsContainer) return;
        
        groupsContainer.innerHTML = '';
        
        const filteredGroups = searchTerm ? 
            studyGroups.filter(group => 
                group.module.toLowerCase().includes(searchTerm) ||
                group.notes.toLowerCase().includes(searchTerm)
            ) : studyGroups;

        if (filteredGroups.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        filteredGroups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';
            groupCard.innerHTML = `
                <div class="group-header">
                    <div class="module-name">${group.module}</div>
                    <div class="status">${group.status}</div>
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
                        <span>${group.times.join(', ') || 'No times selected'}</span>
                    </div>
                </div>
                <div class="group-notes">
                    <strong>Study Focus:</strong> ${group.notes}
                </div>
            `;
            groupsContainer.appendChild(groupCard);
        });
    }

    // Initial render
    renderStudyGroups();
});