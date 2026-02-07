document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.querySelector('input[placeholder="First name"]').value;
        const lastName = document.querySelector('input[placeholder="Last name"]').value;
        const email = document.querySelector('input[type="email"]').value;
        const password = document.querySelector('input[placeholder="Create password"]').value;

        try {
            const response = await apiCall(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    password: password
                })
            });

            // STORE SAME FORMAT AS LOGIN
            localStorage.setItem("auth_token", response.token);
            localStorage.setItem("user_email", response.user.email);
            localStorage.setItem("user", JSON.stringify(response.user));

            alert("Signup successful!");
            window.location.href = "home.html";
        } catch (error) {
            alert("Signup failed: " + error.message);
        }
    });
});
