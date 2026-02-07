document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please sign in to access this page');
        window.location.href = 'signin.html';
        return;
    }

    // Load fresh user data from backend
    await loadUserData();
    
    // Password visibility toggle
    const passwordToggle = document.querySelectorAll('.toggle-password');
    passwordToggle.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Profile photo upload (if you have this feature)
    const photoUpload = document.getElementById('photoUpload');
    if (photoUpload) {
        photoUpload.addEventListener('change', handlePhotoUpload);
    }
});

async function loadUserData() {
    try {
        // Get fresh user data from backend
        const response = await apiCall(API_ENDPOINTS.AUTH.GET_USER);
        const userData = response.user;
        
        // Update localStorage with fresh data
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Display user data
        displayUserInfo(userData);
    } catch (error) {
        console.error('Error loading user data:', error);
        // Fall back to localStorage data
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        displayUserInfo(currentUser);
    }
}

function displayUserInfo(user) {
    // Display basic info
    document.getElementById('displayFirstName').textContent = user.first_name || '';
    document.getElementById('displayLastName').textContent = user.last_name || '';
    document.getElementById('displayUsername').textContent = user.username || '';
    document.getElementById('displayEmail').textContent = user.email || '';
    
    // Fill form fields (if you have edit functionality)
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    
    if (firstNameInput) firstNameInput.value = user.first_name || '';
    if (lastNameInput) lastNameInput.value = user.last_name || '';
    if (emailInput) emailInput.value = user.email || '';
    
    // Display profile photo
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto) {
        if (user.profile_photo) {
            profilePhoto.src = user.profile_photo;
        } else {
            profilePhoto.src = 'images/default-avatar.png'; // Add a default avatar
        }
    }
}

async function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
    }
    
    try {
        // Convert to base64
        const base64Image = await convertImageToBase64(file);
        
        // Update profile photo via API (you'll need to create this endpoint)
        // For now, just update localStorage and display
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser.profile_photo = base64Image;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Display new photo
        document.getElementById('profilePhoto').src = base64Image;
        
        alert('Profile photo updated successfully!');
    } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo');
    }
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}