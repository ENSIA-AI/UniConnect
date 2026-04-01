const form = document.getElementById("moduleForm");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const moduleName = document.getElementById("moduleName");
    const year = document.getElementById("year");
    const driveLink = document.getElementById("driveLink");
    const confirmDrive = document.getElementById("confirmDriveLink");

    // Remove previous errors
    form.querySelectorAll(".error-message").forEach(msg => msg.remove());

    let valid = true;

    // Module Name
    if (moduleName.value.trim() === "") {
        showError(moduleName, "Module name is required");
        valid = false;
    }

    // Year validation
    if (year.value.trim() === "") {
        showError(year, "Year of study is required");
        valid = false;
    } else if (isNaN(year.value.trim())) {
        showError(year, "Year must be a number");
        valid = false;
    }

    // Drive Link validation
    if (driveLink.value.trim() === "") {
        showError(driveLink, "Drive link is required");
        valid = false;
    } else if (!isValidURL(driveLink.value.trim())) {
        showError(driveLink, "Please enter a valid URL");
        valid = false;
    }

    // Confirm Drive Link
    if (confirmDrive.value.trim() === "") {
        showError(confirmDrive, "Please confirm the Drive Link");
        valid = false;
    } else if (driveLink.value.trim() !== confirmDrive.value.trim()) {
        showError(confirmDrive, "Drive links do not match");
        valid = false;
    }

    if (valid) {
        // Redirect
        window.location.href = "modules.html";
    }
});

function showError(input, message) {
    const small = document.createElement("small");
    small.classList.add("error-message");
    small.innerText = message;
    input.parentElement.appendChild(small);
}

// URL validation
function isValidURL(string) {
    const pattern = new RegExp('^(https?:\\/\\/)?'+
      '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})'+
      '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*'+
      '(\\?[;&a-zA-Z\\d%_.~+=-]*)?'+
      '(\\#[-a-zA-Z\\d_]*)?$','i');
    return !!pattern.test(string);
}
