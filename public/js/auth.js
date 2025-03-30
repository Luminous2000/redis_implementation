// Password Strength Checker
const passwordInput = document.querySelector('input[type="password"]');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        updatePasswordStrengthIndicator(strength);
    });
}

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
}

function updatePasswordStrengthIndicator(strength) {
    const indicator = document.querySelector('.password-strength');
    if (!indicator) return;

    const strengthText = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
    const strengthColors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];
    
    indicator.textContent = strengthText[strength - 1] || '';
    indicator.style.color = strengthColors[strength - 1] || '#6b7280';
}

// Password Confirmation Check
const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
        const password = document.querySelector('input[name="password"]').value;
        if (this.value !== password) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });
}

// Remember Me Functionality
const rememberMeCheckbox = document.querySelector('input[name="rememberMe"]');
if (rememberMeCheckbox) {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        document.querySelector('input[name="email"]').value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    rememberMeCheckbox.addEventListener('change', function() {
        const emailInput = document.querySelector('input[name="email"]');
        if (this.checked) {
            localStorage.setItem('rememberedEmail', emailInput.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
    });
}

// Social Login Buttons
const socialLoginButtons = document.querySelectorAll('.social-login-btn');
socialLoginButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.dataset.provider;
        window.location.href = `/auth/${provider}`;
    });
});

// Forgot Password Form
const forgotPasswordForm = document.querySelector('.forgot-password-form');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.querySelector('input[name="email"]').value;
        
        try {
            const response = await fetch('/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            
            if (data.success) {
                showAlert('success', 'Password reset instructions have been sent to your email.');
                this.reset();
            } else {
                showAlert('error', data.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            showAlert('error', 'An error occurred. Please try again later.');
        }
    });
}

// Alert Helper Function
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.auth-container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 5000);
}

// Session Timeout Warning
let sessionTimeout;
const sessionWarning = document.querySelector('.session-warning');
if (sessionWarning) {
    const warningTime = 5 * 60 * 1000; // 5 minutes
    const logoutTime = 30 * 60 * 1000; // 30 minutes

    function resetSessionTimer() {
        clearTimeout(sessionTimeout);
        sessionTimeout = setTimeout(() => {
            showSessionWarning();
        }, logoutTime - warningTime);
    }

    function showSessionWarning() {
        sessionWarning.classList.remove('d-none');
        setTimeout(() => {
            window.location.href = '/auth/logout';
        }, warningTime);
    }

    // Reset timer on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetSessionTimer);
    });

    // Initial timer setup
    resetSessionTimer();
} 