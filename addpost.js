const form = document.getElementById("postForm");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    // Get inputs
    const itemName = document.getElementById("itemName");
    const email = document.getElementById("email");
    const price = document.getElementById("price");
    const description = document.getElementById("description");
    const image = document.getElementById("image");

    let valid = true;

    // Clear previous errors
    document.querySelectorAll(".error-message").forEach(msg => msg.style.display = "none");

    // Validate item name
    if (itemName.value.trim() === "") {
        showError(itemName, "Item name is required");
        valid = false;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
        showError(email, "Email is required");
        valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
        showError(email, "Please enter a valid email");
        valid = false;
    }

    // Validate price
    if (price.value.trim() === "") {
        showError(price, "Price is required");
        valid = false;
    }

    // Validate description
    if (description.value.trim() === "") {
        showError(description, "Description is required");
        valid = false;
    }

    // Validate image
    if (image.files.length === 0) {
        showError(image, "Please add an image");
        valid = false;
    }

    if (valid) {
        // Redirect to marketplace page
        window.location.href = "marketplace.html";
    }
});

// Function to show error below the input
function showError(input, message) {
    const small = input.parentElement.querySelector(".error-message");
    small.innerText = message;
    small.style.display = "block";
}
