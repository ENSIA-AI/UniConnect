document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addModuleForm');
    
    // Check authentication and auto-fill email
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please sign in to add a module');
        window.location.href = 'signin.html';
        return;
    }
    
    // Auto-fill owner email
    const ownerEmailInput = document.getElementById('ownerEmail');
    if (ownerEmailInput && currentUser.email) {
        ownerEmailInput.value = currentUser.email;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            module_name: document.getElementById('moduleName').value.trim(),
            semester: document.getElementById('semester').value.trim(),
            coefficient: parseInt(document.getElementById('coefficient').value),
            module_link: document.getElementById('moduleLink').value.trim(),
            image_url: document.getElementById('imageUrl').value.trim(),
            description: document.getElementById('description').value.trim(),
            resources_count: 0
        };
        
        // Validate email
        if (!validateEnsiaEmail(currentUser.email)) {
            showError('Please use a valid ENSIA email address');
            return;
        }

        if (!isValidURL(formData.module_link)) {
            showError('Please enter a valid URL for the module resources');
            return;
        }

        if (formData.image_url && !isValidURL(formData.image_url)) {
            showError('Please enter a valid URL for the module image');
            return;
        }

        try {
            const response = await apiCall(API_ENDPOINTS.MODULES.CREATE, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            showSuccess(formData);
            setTimeout(() => {
                window.location.href = 'resourcesharing.html';
            }, 2000);
        } catch (error) {
            showError('Failed to add module: ' + error.message);
        }
    });

    function validateEnsiaEmail(email) {
        const ensiaRegex = /^[a-z]+\.[a-z]+@ensia\.edu\.dz$/i;
        return ensiaRegex.test(email);
    }

    function isValidURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

    function showError(message) {
        const oldMessages = document.querySelectorAll('.error-message, .success-message');
        oldMessages.forEach(msg => msg.remove());

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background-color: #f8d7da;
            color: #721c24;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(errorDiv, formContainer.firstChild);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => errorDiv.remove(), 5000);
    }

    function showSuccess(moduleData) {
        const oldMessages = document.querySelectorAll('.error-message, .success-message');
        oldMessages.forEach(msg => msg.remove());

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #c3e6cb;
            text-align: center;
            animation: slideDown 0.3s ease;
        `;
        successDiv.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 1.5rem; display: block; margin-bottom: 8px;"></i>
            <strong>Module "${moduleData.module_name}" added successfully!</strong><br>
            <small>Redirecting to Resource Sharing...</small>
        `;

        const formContainer = document.querySelector('.form-container');
        formContainer.insertBefore(successDiv, formContainer.firstChild);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});