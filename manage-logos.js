document.addEventListener('DOMContentLoaded', function () {
    // Load logos from localStorage
    let logos = JSON.parse(localStorage.getItem('teamLogos')) || [];
  
    // Render logos
    function renderLogos() {
      const logoList = document.getElementById('logo-list');
      logoList.innerHTML = logos.length ? logos.map((logo, index) => `
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body d-flex align-items-center">
              <img src="${logo.url}" alt="${logo.team} logo" style="width: 50px; height: 50px; margin-right: 15px;">
              <div>
                <h6 class="mb-0">${logo.team}</h6>
                <small class="text-muted">${logo.url}</small>
              </div>
              <button class="btn btn-danger btn-sm ms-auto" data-index="${index}">Delete</button>
            </div>
          </div>
        </div>
      `).join('') : '<div class="col-12"><p class="text-muted">No logos added yet.</p></div>';
  
      // Add delete event listeners
      document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', function () {
          const index = parseInt(this.getAttribute('data-index'), 10);
          logos.splice(index, 1);
          localStorage.setItem('teamLogos', JSON.stringify(logos));
          renderLogos();
        });
      });
    }
  
    // Handle logo form submission
    document.getElementById('add-logo-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const teamName = document.getElementById('team-name').value.trim();
      const logoUrl = document.getElementById('logo-url').value.trim();
  
      // Validate inputs
      if (logos.some(logo => logo.team.toLowerCase() === teamName.toLowerCase())) {
        alert('Team name already exists.');
        return;
      }
      if (!isValidUrl(logoUrl)) {
        alert('Please enter a valid URL.');
        return;
      }
  
      logos.push({ team: teamName, url: logoUrl });
      localStorage.setItem('teamLogos', JSON.stringify(logos));
      this.reset();
      renderLogos();
    });
  
    // Validate URL
    function isValidUrl(url) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
  
    // Logout
    document.getElementById('logout-btn').addEventListener('click', function () {
      localStorage.removeItem('loggedInUser');
      window.location.href = 'login.html';
    });
  
    // Initial render
    renderLogos();
  });