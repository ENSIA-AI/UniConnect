document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addPostForm');
    
    // Check authentication and auto-fill email
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please sign in to add an item');
        window.location.href = 'signin.html';
        return;
    }
    
    // Auto-fill seller email
    const sellerEmailInput = document.getElementById('sellerEmail');
    if (sellerEmailInput && currentUser.email) {
        sellerEmailInput.value = currentUser.email;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('itemTitle').value.trim(),
            price: parseFloat(document.getElementById('itemPrice').value),
            description: document.getElementById('description').value.trim(),
            image_url: document.getElementById('imageUrl').value.trim()
        };
        
        // Validate required fields
        if (!formData.title || !formData.description) {
            showError('Please fill in all required fields');
            return;
        }
        
        if (isNaN(formData.price) || formData.price <= 0) {
            showError('Please enter a valid price');
            return;
        }
        
        if (formData.image_url && !isValidURL(formData.image_url)) {
            showError('Please enter a valid URL for the image');
            return;
        }
        
        try {
            const response = await apiCall(API_ENDPOINTS.MARKETPLACE.CREATE, {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            
            showSuccess('Item posted successfully!');
            setTimeout(() => {
                window.location.href = 'Marketplace.html';
            }, 2000);
        } catch (error) {
            showError('Failed to post item: ' + error.message);
        }
    });
    
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
            font-weight: 500;
        `;
        errorDiv.textContent = message;
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    function showSuccess(message) {
        const oldMessages = document.querySelectorAll('.error-message, .success-message');
        oldMessages.forEach(msg => msg.remove());
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #c3e6cb;
            font-weight: 500;
        `;
        successDiv.textContent = message;
        form.insertBefore(successDiv, form.firstChild);
    }
});

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}