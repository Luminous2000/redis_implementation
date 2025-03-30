// Form Validation Class
class FormValidator {
    constructor(form) {
        this.form = form;
        this.fields = {};
        this.errors = {};
        this.setupValidation();
    }

    setupValidation() {
        // Get all form fields
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            this.fields[input.name] = input;
            this.setupFieldValidation(input);
        });

        // Add form submit handler
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
    }

    setupFieldValidation(field) {
        // Add input event listener for real-time validation
        field.addEventListener('input', () => {
            this.validateField(field);
        });

        // Add blur event listener for validation on field blur
        field.addEventListener('blur', () => {
            this.validateField(field);
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const rules = this.getValidationRules(field);
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation
        if (rules.email && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }

        // Min length validation
        if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `Minimum ${rules.minLength} characters required`;
        }

        // Max length validation
        if (rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `Maximum ${rules.maxLength} characters allowed`;
        }

        // Pattern validation
        if (rules.pattern && value && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.patternMessage || 'Invalid format';
        }

        // Password strength validation
        if (rules.password && value) {
            const strength = this.checkPasswordStrength(value);
            if (strength < 3) {
                isValid = false;
                errorMessage = 'Password is too weak';
            }
        }

        // Update field state
        this.updateFieldState(field, isValid, errorMessage);
        return isValid;
    }

    getValidationRules(field) {
        const rules = {
            required: field.hasAttribute('required'),
            email: field.type === 'email',
            minLength: parseInt(field.dataset.minLength) || null,
            maxLength: parseInt(field.dataset.maxLength) || null,
            pattern: field.dataset.pattern ? new RegExp(field.dataset.pattern) : null,
            patternMessage: field.dataset.patternMessage || null,
            password: field.type === 'password'
        };
        return rules;
    }

    updateFieldState(field, isValid, errorMessage) {
        const errorElement = field.nextElementSibling?.classList.contains('error-message') 
            ? field.nextElementSibling 
            : this.createErrorElement(field);

        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            errorElement.textContent = '';
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
            errorElement.textContent = errorMessage;
        }
    }

    createErrorElement(field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message invalid-feedback';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        return errorElement;
    }

    validateForm() {
        let isValid = true;
        this.errors = {};

        Object.values(this.fields).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
                this.errors[field.name] = field.nextElementSibling.textContent;
            }
        });

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        return strength;
    }

    sanitizeInput(input) {
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// Initialize form validation
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        new FormValidator(form);
    });
});

// Input Sanitization
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .trim();
}

// URL Sanitization
function sanitizeURL(url) {
    if (typeof url !== 'string') return url;
    
    try {
        const parsed = new URL(url);
        return parsed.toString();
    } catch (e) {
        return '';
    }
}

// File Upload Validation
function validateFileUpload(file, options = {}) {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
        maxWidth = 1920,
        maxHeight = 1080
    } = options;

    // Check file size
    if (file.size > maxSize) {
        return {
            isValid: false,
            error: 'File size exceeds limit'
        };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: 'Invalid file type'
        };
    }

    // Check image dimensions
    if (file.type.startsWith('image/')) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                if (img.width > maxWidth || img.height > maxHeight) {
                    resolve({
                        isValid: false,
                        error: 'Image dimensions exceed limit'
                    });
                } else {
                    resolve({
                        isValid: true,
                        error: null
                    });
                }
            };
            img.onerror = () => {
                resolve({
                    isValid: false,
                    error: 'Invalid image file'
                });
            };
            img.src = URL.createObjectURL(file);
        });
    }

    return {
        isValid: true,
        error: null
    };
}

// Export functions for use in other files
window.FormValidator = FormValidator;
window.sanitizeInput = sanitizeInput;
window.sanitizeURL = sanitizeURL;
window.validateFileUpload = validateFileUpload; 