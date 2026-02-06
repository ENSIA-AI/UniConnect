document.addEventListener('DOMContentLoaded', async function() {
    
    /* ================= SIDEBAR TOGGLE ================= */
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const logoutBtn = document.getElementById('logoutBtn');

    let userData = null;
    
    const token = localStorage.getItem('auth_token') || 
                  sessionStorage.getItem('auth_token') || 
                  getCookie('auth_token');
    
    if (!token) {
        alert('Please sign in first');
        window.location.href = 'signin.html';
        return;
    }

    async function loadUserProfile() {
        try {
            const response = await fetch('http://localhost/UniConnect/backend/public/myaccount.php', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                userData = data.user;

                document.getElementById('firstName').textContent = userData.first_name || 'N/A';
                document.getElementById('lastName').textContent = userData.last_name || 'N/A';
                document.getElementById('username').textContent = userData.username || 'N/A';
                document.getElementById('email').textContent = userData.email || 'N/A';

            } else if (response.status === 401) {
                alert('Session expired. Please sign in again.');
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                window.location.href = 'signin.html';
            } else {
                const errorData = await response.json();
                console.error('Error loading profile:', errorData);
                alert('Failed to load profile: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Connection error. Please check if the backend server is running.');
        }
    }

    await loadUserProfile();

    editBtn.addEventListener('click', function() {
        document.getElementById('editFirstName').value = userData.first_name || '';
        document.getElementById('editLastName').value = userData.last_name || '';
        document.getElementById('editUsername').value = userData.username || '';
        document.getElementById('editEmail').value = userData.email || '';

        viewMode.style.display = 'none';
        editMode.style.display = 'grid';
        editBtn.style.display = 'none';
    });

    cancelBtn.addEventListener('click', function() {
        viewMode.style.display = 'grid';
        editMode.style.display = 'none';
        editBtn.style.display = 'flex';
    });

    saveBtn.addEventListener('click', async function() {
        const updatedData = {
            first_name: document.getElementById('editFirstName').value.trim(),
            last_name: document.getElementById('editLastName').value.trim(),
            username: document.getElementById('editUsername').value.trim(),
            email: document.getElementById('editEmail').value.trim()
        };

        if (!updatedData.first_name || !updatedData.last_name || !updatedData.username || !updatedData.email) {
            alert('All fields are required');
            return;
        }

        const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/;
        if (!emailRegex.test(updatedData.email)) {
            alert('Email must be in format: firstname.lastname@ensia.edu.dz');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            const response = await fetch('http://localhost/UniConnect/backend/public/myaccount.php', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                alert('Profile updated successfully!');
                await loadUserProfile();
                viewMode.style.display = 'grid';
                editMode.style.display = 'none';
                editBtn.style.display = 'flex';
            } else {
                const errorData = await response.json();
                alert('Failed to update profile: ' + (errorData.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Connection error. Please try again.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                window.location.href = 'index.html';
            }
        });
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}
