document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputs = form.querySelectorAll("input");
  const signupBtn = document.querySelector('.signup-btn');

  inputs.forEach(input => {
    input.addEventListener("input", () => validateField(input));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let valid = true;
    inputs.forEach(input => {
      if (!validateField(input)) valid = false;
    });

    if (!valid) {
      return;
    }

    // Show loading state
    const originalText = signupBtn.textContent;
    signupBtn.textContent = 'Creating account...';
    signupBtn.disabled = true;

    const firstName = inputs[0].value.trim();
    const lastName = inputs[1].value.trim();
    const email = inputs[2].value.trim();
    const password = inputs[3].value;

    // Generate username
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

    console.log('Sending signup request...'); // Debug

    try {
      const response = await fetch('http://localhost/UniConnect/backend/public/signup.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username: username,
          email: email,
          password: password
        })
      });

      console.log('Response status:', response.status); // Debug

      const data = await response.json();
      console.log('Response data:', data); // Debug

      if (response.ok) {
        // ✅ SUCCESS - Save token and user data
        console.log('Signup successful!');
        console.log('Token:', data.token);
        
        // CRITICAL: Save to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Verify it was saved
        const savedToken = localStorage.getItem('auth_token');
        console.log('Token saved successfully?', savedToken ? 'YES' : 'NO');
        console.log('Saved token:', savedToken);
        
        // Show success message
        alert('Account created successfully! Welcome to UniConnect!');
        
        // Redirect to home
        console.log('Redirecting to home.html...');
        window.location.href = 'home.html';
        
      } else {
        // ❌ ERROR
        console.error('Signup failed:', data);
        alert(data.error || 'Signup failed. Please try again.');
        signupBtn.textContent = originalText;
        signupBtn.disabled = false;
      }

    } catch (error) {
      console.error('Network error:', error);
      alert('Connection error. Please check if XAMPP is running.');
      signupBtn.textContent = originalText;
      signupBtn.disabled = false;
    }
  });

  function validateField(input) {
    removeError(input);
    const value = input.value.trim();
    let valid = true;

    if (input.placeholder === "First name" || input.placeholder === "Last name") {
      if (!value) {
        showError(input, "This field is required");
        valid = false;
      }
    } 
    else if (input.type === "email") {
      if (!value) {
        showError(input, "Email is required");
        valid = false;
      } else if (!/^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/.test(value)) {
        showError(input, "Email must be firstname.lastname@ensia.edu.dz");
        valid = false;
      }
    } 
    else if (input.placeholder === "Create password") {
      if (!value) {
        showError(input, "Password is required");
        valid = false;
      } else if (value.length < 6) {
        showError(input, "Password must be at least 6 characters");
        valid = false;
      } else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        showError(input, "Password must contain letters and numbers");
        valid = false;
      }
    } 
    else if (input.placeholder === "Confirm password") {
      const passValue = form.querySelector('input[placeholder="Create password"]').value;
      if (!value) {
        showError(input, "Please confirm your password");
        valid = false;
      } else if (value !== passValue) {
        showError(input, "Passwords do not match");
        valid = false;
      }
    }

    input.style.borderColor = valid ? "#999" : "red";
    return valid;
  }

  function showError(input, message) {
    const error = document.createElement("p");
    error.className = "error-msg";
    error.textContent = message;
    input.parentElement.appendChild(error);
  }

  function removeError(input) {
    const error = input.parentElement.querySelector(".error-msg");
    if (error) error.remove();
  }
});
