document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sign in JavaScript is running!');

    const form = document.querySelector('form');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const signinBtn = document.querySelector('.signin-btn');
    const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/;

    function validateEmail(email) {
        return emailRegex.test(email);
    }

    function showError(input, message) {
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '#dc3545';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.textAlign = 'left';
        input.parentElement.appendChild(errorDiv);
    }

    function clearError(input) {
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '#ccc';
    }

    emailInput.addEventListener('input', function() {
        clearError(emailInput);
    });

    passwordInput.addEventListener('input', function() {
        clearError(passwordInput);
    });

    signinBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        console.log('🚀 Sign in button clicked!');

        let isValid = true;
        clearError(emailInput);
        clearError(passwordInput);

        if (!emailInput.value.trim()) {
            showError(emailInput, 'Email is required');
            isValid = false;
        } else if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Email must be in format: firstname.lastname@ensia.edu.dz');
            isValid = false;
        }

        if (!passwordInput.value) {
            showError(passwordInput, 'Password is required');
            isValid = false;
        } else if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        }

        if (!isValid) {
            console.log('❌ Validation failed');
            return;
        }

        console.log('✅ Validation passed');

        const originalText = signinBtn.textContent;
        signinBtn.textContent = 'Signing in...';
        signinBtn.disabled = true;

        console.log('📤 Sending signin request...');

        try {
            // ✅ USE TEAMMATE'S API
            const response = await fetch('http://localhost/UniConnect/backend/api/auth.php?action=login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value
                })
            });

            console.log('📥 Response status:', response.status);
            const data = await response.json();
            console.log('📥 Response data:', data);

            if (response.ok) {
                console.log('✅ Sign in successful!');
                console.log('🔑 Token:', data.token);

                // SAVE TO LOCALSTORAGE
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));

                // VERIFY
                const savedToken = localStorage.getItem('auth_token');
                console.log('💾 Token saved?', savedToken ? 'YES ✅' : 'NO ❌');
                console.log('💾 Saved token:', savedToken);

                alert('Welcome back to UniConnect!');
                console.log('🔄 Redirecting to home.html...');
                window.location.href = 'home.html';

            } else {
                console.error('❌ Signin failed:', data);
                showError(passwordInput, data.message || 'Invalid email or password');
                signinBtn.textContent = originalText;
                signinBtn.disabled = false;
            }

        } catch (error) {
            console.error('💥 Network error:', error);
            alert('Connection error. Please check if XAMPP is running.');
            signinBtn.textContent = originalText;
            signinBtn.disabled = false;
        }
    });

    emailInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            signinBtn.click();
        }
    });

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            signinBtn.click();
        }
    });
});