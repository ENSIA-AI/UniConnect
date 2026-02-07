document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('form');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const signinBtn = document.querySelector('.signin-btn');
    const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@ensia\.edu\.dz$/;

    signinBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        if (!emailRegex.test(emailInput.value)) {
            alert("Invalid email format");
            return;
        }

        try {
            const response = await apiCall(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value
                })
            });

            //STORE CONSISTENT DATA
            localStorage.setItem("auth_token", response.token);
            localStorage.setItem("user_email", response.user.email);
            localStorage.setItem("user", JSON.stringify(response.user));

            window.location.href = "home.html";
        } catch (error) {
            alert(error.message || "Login failed");
        }
    });
});
