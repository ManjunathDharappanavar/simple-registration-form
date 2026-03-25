document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('submitBtn');

    // Regex patterns for validation
    const patterns = {
        username: /^[a-zA-Z0-9_]{3,16}$/, // 3-16 chars, alphanumeric/underscore
        email: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, // basic email format
        password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/ // Min 8, 1 upper, 1 lower, 1 number
    };

    // UI helpers
    const setError = (element, message) => {
        const inputGroup = element.parentElement;
        const errorDisplay = document.getElementById(`${element.id}Error`);
        
        inputGroup.classList.remove('success');
        inputGroup.classList.add('error');
        errorDisplay.innerText = message;
        errorDisplay.classList.add('show');
    };

    const setSuccess = (element) => {
        const inputGroup = element.parentElement;
        const errorDisplay = document.getElementById(`${element.id}Error`);
        
        inputGroup.classList.remove('error');
        if (element.value.trim() !== '') {
            inputGroup.classList.add('success');
        }
        errorDisplay.innerText = '';
        errorDisplay.classList.remove('show');
    };

    // Validation functions
    const validateUsername = () => {
        const value = usernameInput.value.trim();
        if (!value) {
            setError(usernameInput, 'Username is required');
            return false;
        } else if (!patterns.username.test(value)) {
            setError(usernameInput, 'Must be 3-16 characters (letters, numbers, _)');
            return false;
        }
        setSuccess(usernameInput);
        return true;
    };

    const validateEmail = () => {
        const value = emailInput.value.trim();
        if (!value) {
            setError(emailInput, 'Email is required');
            return false;
        } else if (!patterns.email.test(value)) {
            setError(emailInput, 'Please enter a valid email address');
            return false;
        }
        setSuccess(emailInput);
        return true;
    };

    const validatePassword = () => {
        const value = passwordInput.value;
        if (!value) {
            setError(passwordInput, 'Password is required');
            return false;
        } else if (!patterns.password.test(value)) {
            setError(passwordInput, 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number');
            return false;
        }
        setSuccess(passwordInput);
        
        // Re-validate confirm password if it already has input
        if (confirmPasswordInput.value) {
            validateConfirmPassword();
        }
        
        return true;
    };

    const validateConfirmPassword = () => {
        const value = confirmPasswordInput.value;
        const passwordValue = passwordInput.value;
        
        if (!value) {
            setError(confirmPasswordInput, 'Please confirm your password');
            return false;
        } else if (value !== passwordValue) {
            setError(confirmPasswordInput, 'Passwords do not match');
            return false;
        }
        setSuccess(confirmPasswordInput);
        return true;
    };

    // Real-time event listeners
    [usernameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('blur', () => {
            if (input.id === 'username') validateUsername();
            if (input.id === 'email') validateEmail();
            if (input.id === 'password') validatePassword();
            if (input.id === 'confirmPassword') validateConfirmPassword();
        });

        // Clear error on generic input
        input.addEventListener('input', () => {
            const group = input.parentElement;
            if (group.classList.contains('error')) {
                if (input.id === 'username') validateUsername();
                if (input.id === 'email') validateEmail();
                if (input.id === 'password') validatePassword();
                if (input.id === 'confirmPassword') validateConfirmPassword();
            }
        });
    });

    // Form submit logic
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all
        const isUsernameValid = validateUsername();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        if (isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid) {
            // Simulate API request visual feedback
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const payload = {
                username: usernameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value
            };

            fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                
                submitBtn.classList.remove('loading');
                submitBtn.style.background = 'var(--success)';
                submitBtn.style.boxShadow = '0 4px 14px 0 rgba(34, 197, 94, 0.39)';
                submitBtn.querySelector('span').innerText = 'Registration Successful!';
                
                // Optional: reset form after delay
                setTimeout(() => {
                    form.reset();
                    document.querySelectorAll('.input-group').forEach(group => {
                        group.classList.remove('success', 'error');
                    });
                    submitBtn.style.background = '';
                    submitBtn.style.boxShadow = '';
                    submitBtn.querySelector('span').innerText = 'Sign Up';
                    submitBtn.disabled = false;
                }, 3000);
            })
            .catch(error => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Show generic error or backend error
                submitBtn.style.background = 'var(--error)';
                submitBtn.style.boxShadow = '0 4px 14px 0 rgba(239, 68, 68, 0.39)';
                submitBtn.querySelector('span').innerText = error.message;

                setTimeout(() => {
                    submitBtn.style.background = '';
                    submitBtn.style.boxShadow = '';
                    submitBtn.querySelector('span').innerText = 'Sign Up';
                }, 3000);
            });
        } else {
            // Error shake animation
            form.classList.add('shake');
            setTimeout(() => {
                form.classList.remove('shake');
            }, 400);
        }
    });
});
