document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginButton = document.getElementById('login-button');
  const buttonText = document.getElementById('button-text');
  const buttonSpinner = document.getElementById('button-spinner');
  const errorMessage = document.getElementById('error-message');

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    buttonText.textContent = 'Logging in...';
    buttonSpinner.classList.remove('hidden');
    loginButton.disabled = true;
    errorMessage.classList.add('hidden');
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('https://api.vybtek.com/api/manuplast/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
      } else {
        showError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      showError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      // Reset button state
      buttonText.textContent = 'Login';
      buttonSpinner.classList.add('hidden');
      loginButton.disabled = false;
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('animate__fadeIn');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      errorMessage.classList.remove('animate__fadeIn');
    }, 1000);
  }
});



document.addEventListener('DOMContentLoaded', () => {
  // Check authentication and token
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const token = localStorage.getItem("token");
  
  if (!isLoggedIn || !token) {
    redirectToLogin();
    return;
  }

  const resetForm = document.getElementById('reset-password-form');
  const resetButton = document.getElementById('reset-button');
  const resetButtonText = document.getElementById('reset-button-text');
  const resetButtonSpinner = document.getElementById('reset-button-spinner');
  const errorMessage = document.getElementById('error-message');
  const successMessage = document.getElementById('success-message');
  const logoutButton = document.getElementById('logout-button');

  resetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    resetButtonText.textContent = 'Updating...';
    resetButtonSpinner.classList.remove('hidden');
    resetButton.disabled = true;
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        redirectToLogin();
        return;
      }

      const response = await fetch("https://api.vybtek.com/api/manuplast/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      // Handle 401 Unauthorized (invalid token)
      if (response.status === 401) {
        redirectToLogin();
        return;
      }

      const data = await response.json();

      if (response.ok) {
        showSuccess("Password updated successfully");
        resetForm.reset();
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 2000);
      } else {
        showError(data.message || "Failed to update password");
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('token')) {
        redirectToLogin();
      } else {
        showError("Network error. Please try again.");
        console.error('Password reset error:', error);
      }
    } finally {
      // Reset button state
      resetButtonText.textContent = 'Update Password';
      resetButtonSpinner.classList.add('hidden');
      resetButton.disabled = false;
    }
  });

  logoutButton.addEventListener('click', function() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    redirectToLogin();
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    errorMessage.classList.add('animate__fadeIn');
    
    setTimeout(() => {
      errorMessage.classList.remove('animate__fadeIn');
    }, 1000);
  }

  function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    successMessage.classList.add('animate__fadeIn');
    
    setTimeout(() => {
      successMessage.classList.remove('animate__fadeIn');
    }, 1000);
  }

  function redirectToLogin() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
  }
});