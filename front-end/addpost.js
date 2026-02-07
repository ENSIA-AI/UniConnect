const form = document.getElementById("postForm");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const itemName = document.getElementById("itemName");
    const price = document.getElementById("price");
    const description = document.getElementById("description");
    const sellerEmail = document.getElementById("sellerEmail");
    const imageFile = document.getElementById("imageFile")?.files[0];

    let valid = true;

    // Clear previous errors
    document.querySelectorAll(".error-message").forEach(msg => {
        msg.style.display = "none";
        msg.textContent = "";
    });

    // Validation
    if (itemName.value.trim() === "" || itemName.value.trim().length < 3) {
        showError(itemName, "Item name must be at least 3 characters");
        valid = false;
    }
    if (price.value.trim() === "" || parseFloat(price.value) <= 0) {
        showError(price, "Price must be greater than 0");
        valid = false;
    }
    if (description.value.trim() === "" || description.value.trim().length < 10) {
        showError(description, "Description must be at least 10 characters");
        valid = false;
    }
    if (sellerEmail.value.trim() === "" || !sellerEmail.value.includes('@')) {
        showError(sellerEmail, "Please enter a valid email address");
        valid = false;
    }
    
    if (!valid) return;

    const submitBtn = form.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    try {
        const formData = new FormData();
        formData.append("title", itemName.value.trim());
        formData.append("description", description.value.trim());
        formData.append("price", parseFloat(price.value));
        formData.append("seller_email", sellerEmail.value.trim());
        if (imageFile) formData.append("image", imageFile);

        const response = await fetch('http://localhost/UniConnect/backend/api/marketplace.php', {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Failed to post item');

        alert('Item posted successfully!');
        window.location.href = "Marketplace.html";
    } catch (error) {
        console.error("Post error:", error);
        alert('Failed to post item: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Item';
    }
});

function showError(input, message) {
    const errorElement = input.parentElement.querySelector(".error-message");
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = "block";
        input.style.borderColor = "#DC2626";
    }
}

// Clear error on input
document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', function() {
        const errorElement = this.parentElement.querySelector(".error-message");
        if (errorElement) {
            errorElement.style.display = "none";
            this.style.borderColor = "#DDD6FE";
        }
    });
});