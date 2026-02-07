document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        alert('Please login first!');
        window.location.href = 'signin.html';
        return;
    }

    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    let userData = JSON.parse(localStorage.getItem('user'));

    function renderProfile() {
        document.getElementById('firstName').textContent = userData.first_name;
        document.getElementById('lastName').textContent = userData.last_name;
        document.getElementById('username').textContent = userData.username;
        document.getElementById('email').textContent = userData.email;
    }

    renderProfile();

    editBtn.addEventListener('click', () => {
        document.getElementById('editFirstName').value = userData.first_name;
        document.getElementById('editLastName').value = userData.last_name;
        document.getElementById('editUsername').value = userData.username;
        document.getElementById('editEmail').value = userData.email;

        viewMode.style.display = 'none';
        editMode.style.display = 'grid';
    });

    cancelBtn.addEventListener('click', () => {
        viewMode.style.display = 'grid';
        editMode.style.display = 'none';
    });

    saveBtn.addEventListener('click', async () => {
        const updated = {
            first_name: document.getElementById('editFirstName').value.trim(),
            last_name: document.getElementById('editLastName').value.trim(),
            username: document.getElementById('editUsername').value.trim(),
            email: document.getElementById('editEmail').value.trim()
        };

        try {
            const res = await fetch('http://localhost/UniConnect/backend/public/myaccount.php', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updated)
            });
            const data = await res.json();
            if (res.ok) {
                userData = data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                renderProfile();
                viewMode.style.display = 'grid';
                editMode.style.display = 'none';
                alert('Profile updated!');
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (err) {
            alert('Connection error: ' + err.message);
        }
    });

    logoutBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
    });
});
