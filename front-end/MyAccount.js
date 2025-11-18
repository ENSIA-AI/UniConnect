// My Account JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const changePhotoBtn = document.querySelector('.change-photo-btn');
    const avatarPlaceholder = document.querySelector('.avatar-placeholder');
    
    // Change photo functionality
    if (changePhotoBtn && avatarPlaceholder) {
        changePhotoBtn.addEventListener('click', function() {
            // Create file input for photo upload
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        // Create img element instead of using icon
                        avatarPlaceholder.innerHTML = '';
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '100%';
                        img.style.height = '100%';
                        img.style.borderRadius = '50%';
                        img.style.objectFit = 'cover';
                        avatarPlaceholder.appendChild(img);
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            fileInput.click();
        });
    }

    // Form submission handling
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple validation
            const username = document.getElementById('username');
            const email = document.getElementById('email');
            
            if (username && username.value.length < 3) {
                alert('Username must be at least 3 characters long');
                return;
            }
            
            if (email && !validateEmail(email.value)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Show success message
            alert('Profile updated successfully!');
            
            // In a real app, you would send data to server here
            console.log('Profile data saved');
        });
    }

    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});