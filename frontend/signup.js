document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const inputs = form.querySelectorAll("input");

  inputs.forEach(input => {
    input.addEventListener("input", () => validateField(input));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    inputs.forEach(input => {
      if (!validateField(input)) valid = false;
    });

    if (valid) {
      alert("Signup successful!");
      form.reset();
      inputs.forEach(input => input.style.borderColor = "#999");
      const errors = form.querySelectorAll(".error-msg");
      errors.forEach(e => e.remove());
    }
  });

  function validateField(input) {
    removeError(input);
    const value = input.value.trim();
    let valid = true;

    if (input.placeholder === "First name" || input.placeholder === "Last name") {
      if (!value) { showError(input, "This field is required"); valid = false; }
    } 
    else if (input.type === "email") {
      if (!value) { showError(input, "Email is required"); valid = false; }
      else if (!/^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/.test(value)) {
        showError(input, "Email must be firstname.lastname@ensia.edu.dz");
        valid = false;
      }
    } 
    else if (input.placeholder === "Create password") {
      if (!value) { showError(input, "Password is required"); valid = false; }
      else if (value.length < 6) { showError(input, "Password must be at least 6 characters"); valid = false; }
      else if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        showError(input, "Password must contain letters and numbers"); valid = false;
      }
    } 
    else if (input.placeholder === "Confirm password") {
      const passValue = form.querySelector('input[placeholder="Create password"]').value;
      if (!value) { showError(input, "Please confirm your password"); valid = false; }
      else if (value !== passValue) { showError(input, "Passwords do not match"); valid = false; }
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
