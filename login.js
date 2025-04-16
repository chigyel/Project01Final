document.addEventListener('DOMContentLoaded', function () {
    // Default credentials
    const defaultUsers = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'user', password: 'user123', role: 'user' }
    ];
  
    // Handle login form submission
    document.getElementById('login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const errorMessage = document.getElementById('error-message');
  
      // Validate credentials
      const user = defaultUsers.find(u => u.username === username && u.password === password);
      if (user) {
        // Store logged-in user info
        localStorage.setItem('loggedInUser', JSON.stringify({
          username: user.username,
          role: user.role
        }));
        // Redirect to main page
        window.location.href = 'index.html';
      } else {
        errorMessage.textContent = 'Invalid username or password';
        errorMessage.style.display = 'block';
      }
    });
  });
  