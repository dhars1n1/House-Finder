document.addEventListener('DOMContentLoaded', function() {

    // Initialize phone input
    const phoneInput = window.intlTelInput(document.querySelector("#phone"), {
        preferredCountries: ["in"],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
    });

    // User Type Toggle
    const seeker = document.getElementById('seeker');
    const owner = document.getElementById('owner');
    const seekerFields = document.getElementById('seekerFields');
    const ownerFields = document.getElementById('ownerFields');

    if (seeker && owner) {
        seeker.addEventListener('change', function() {
            if (this.checked) {
                seekerFields.classList.remove('d-none');
                ownerFields.classList.add('d-none');
            }
        });

        owner.addEventListener('change', function() {
            if (this.checked) {
                ownerFields.classList.remove('d-none');
                seekerFields.classList.add('d-none');
            }
        });
    }

    // Auth Method Toggle
    const emailMethod = document.getElementById('email-method');
    const phoneMethod = document.getElementById('phone-method');
    const emailGroup = document.getElementById('emailGroup');
    const phoneGroup = document.getElementById('phoneGroup');

    if (emailMethod && phoneMethod) {
        emailMethod.addEventListener('change', function() {
            if (this.checked) {
                emailGroup.classList.remove('d-none');
                phoneGroup.classList.add('d-none');
                document.getElementById('otpSection').classList.add('d-none');
            }
        });

        phoneMethod.addEventListener('change', function() {
            if (this.checked) {
                phoneGroup.classList.remove('d-none');
                emailGroup.classList.add('d-none');
            }
        });
    }

    // Password Strength and Visibility
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const togglePassword = document.getElementById('togglePassword');
    const passwordStrength = document.getElementById('passwordStrength');

    if (password) {
        password.addEventListener('input', function() {
            const result = zxcvbn(this.value);
            updatePasswordStrength(result.score);
        });

        if (togglePassword) {
            togglePassword.addEventListener('click', function() {
                const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
                password.setAttribute('type', type);
                confirmPassword.setAttribute('type', type);
                this.querySelector('i').classList.toggle('fa-eye');
                this.querySelector('i').classList.toggle('fa-eye-slash');
            });
        }
    }

    function updatePasswordStrength(score) {
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength-bar';

        // Remove any existing strength bars
        while (passwordStrength.firstChild) {
            passwordStrength.removeChild(passwordStrength.firstChild);
        }

        // Add the new strength bar
        passwordStrength.appendChild(strengthBar);

        // Update the strength bar based on the score
        switch (score) {
            case 0:
                strengthBar.className += ' strength-weak';
                break;
            case 1:
            case 2:
                strengthBar.className += ' strength-fair';
                break;
            case 3:
                strengthBar.className += ' strength-good';
                break;
            case 4:
                strengthBar.className += ' strength-strong';
                break;
        }
    }

    // OTP Handling
    let otpTimer;
    const otpSection = document.getElementById('otpSection');
    const resendOtp = document.getElementById('resendOtp');
    const otpInputs = document.querySelectorAll('.otp-input');

    function startOtpTimer() {
        let timeLeft = 60;
        const timerSpan = document.querySelector('#otpTimer span');
        resendOtp.disabled = true;

        otpTimer = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(otpTimer);
                resendOtp.disabled = false;
            }
        }, 1000);
    }

    // Auto-focus next OTP input
    otpInputs.forEach((input, index) => {
        input.addEventListener('keyup', function(e) {
            if (e.key >= 0 && e.key <= 9) {
                if (index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            } else if (e.key === 'Backspace') {
                if (index > 0) {
                    otpInputs[index - 1].focus();
                }
            }
        });
    });

    // Form Validation and Submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            let errorMessage = '';

            // Basic validation
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;

            if (!firstName || !lastName) {
                isValid = false;
                errorMessage = 'Please enter your full name';
            }

            if (emailMethod.checked) {
                const email = document.getElementById('email').value;
                if (!validateEmail(email)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            } else {
                if (!phoneInput.isValidNumber()) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
            }

            // Password validation
            const passwordValue = password.value;
            const confirmValue = confirmPassword.value;

            if (passwordValue.length < 8) {
                isValid = false;
                errorMessage = 'Password must be at least 8 characters long';
            } else if (passwordValue !== confirmValue) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }

            // Terms validation
            if (!document.getElementById('terms').checked) {
                isValid = false;
                errorMessage = 'Please accept the Terms of Service and Privacy Policy';
            }

            if (!isValid) {
                showError(errorMessage);
                return;
            }

            // If phone verification is needed
            if (phoneMethod.checked && !otpSection.classList.contains('verified')) {
                otpSection.classList.remove('d-none');
                startOtpTimer();
                return;
            }

            // If validation passes, proceed with signup
            console.log('Form is valid, proceeding with signup...');
            // Add your signup logic here
        });
    }

    // Email validation helper
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Error display helper
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
        errorDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        signupForm.insertBefore(errorDiv, signupForm.firstChild);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            errorDiv.classList.remove('show');
            setTimeout(() => errorDiv.remove(), 150);
        }, 5000);
    }
});

