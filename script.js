document.addEventListener('DOMContentLoaded', function () {
  // Initialize variables
  let currentSport = 'football';
  let currentGender = 'mens';
  let fixtureToDelete = null;
  let fixtureToUpdateScore = null;

  // Check logged-in user and role
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (loggedInUser && loggedInUser.role === 'admin') {
      document.getElementById('add-fixture-btn').style.display = 'inline-block';
      document.getElementById('manage-logos-btn').style.display = 'inline-block';
  }

  // Load fixtures and logos
  let fixtures = JSON.parse(localStorage.getItem('sportFixtures')) || {
      football: { mens: [], womens: [] },
      volleyball: { mens: [], womens: [] },
      basketball: { mens: [], womens: [] },
      futsal: { mens: [], womens: [] },
  };
  let logos = JSON.parse(localStorage.getItem('teamLogos')) || [];

  // Initialize modals
  const deleteConfirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  const updateScoreModal = new bootstrap.Modal(document.getElementById('updateScoreModal'));

  // Populate team dropdowns
  function populateTeamDropdowns() {
      const team1Select = document.getElementById('fixture-team1');
      const team2Select = document.getElementById('fixture-team2');
      team1Select.innerHTML = '<option value="">Select Team</option>' + logos.map(logo => `
          <option value="${logo.team}" data-url="${logo.url}">${logo.team}</option>
      `).join('');
      team2Select.innerHTML = '<option value="">Select Team</option>' + logos.map(logo => `
          <option value="${logo.team}" data-url="${logo.url}">${logo.team}</option>
      `).join('');
  }

  // Set up delete confirmation button
  document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
      if (fixtureToDelete) {
          const { sport, gender, index } = fixtureToDelete;
          fixtures[sport][gender].splice(index, 1);
          localStorage.setItem('sportFixtures', JSON.stringify(fixtures));
          deleteConfirmModal.hide();
          fixtureToDelete = null;
          renderAllFixtures();
      }
  });

  // Set up score update button
  document.getElementById('confirmScoreUpdateBtn').addEventListener('click', function () {
      if (fixtureToUpdateScore) {
          const { sport, gender, index } = fixtureToUpdateScore;
          const team1Score = document.getElementById('team1-score').value;
          const team2Score = document.getElementById('team2-score').value;
          const matchStatus = document.getElementById('match-status').value;

          fixtures[sport][gender][index].team1Score = team1Score;
          fixtures[sport][gender][index].team2Score = team2Score;
          fixtures[sport][gender][index].status = matchStatus;

          localStorage.setItem('sportFixtures', JSON.stringify(fixtures));
          updateScoreModal.hide();
          fixtureToUpdateScore = null;
          renderAllFixtures();
      }
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', function () {
      localStorage.removeItem('loggedInUser');
      window.location.href = 'login.html';
  });

  // Render all fixtures on page load
  renderAllFixtures();
  populateTeamDropdowns();

  // Sport tab switching
  const sportTabs = document.querySelectorAll('.sport-tab');
  sportTabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
          e.preventDefault();
          const sport = this.getAttribute('data-sport');
          sportTabs.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
          document.querySelectorAll('.sport-content').forEach(content => {
              content.classList.remove('active');
          });
          const contentElement = document.getElementById(`${sport}-content`);
          if (contentElement) {
              contentElement.classList.add('active');
              currentSport = sport;
          }
      });
  });

  // Gender toggle functionality
  const genderToggles = document.querySelectorAll('.gender-toggle');
  genderToggles.forEach(toggle => {
      toggle.addEventListener('click', function () {
          const sport = this.getAttribute('data-sport');
          const gender = this.getAttribute('data-gender');
          document.querySelectorAll(`.gender-toggle[data-sport="${sport}"]`).forEach(t => {
              t.classList.remove('active');
              t.classList.remove('btn-primary');
              t.classList.add('btn-outline-primary');
          });
          this.classList.add('active');
          this.classList.remove('btn-outline-primary');
          this.classList.add('btn-primary');
          document.querySelectorAll(`#${sport}-content .gender-content`).forEach(content => {
              content.classList.remove('active');
          });
          const genderContentElement = document.getElementById(`${sport}-${gender}`);
          if (genderContentElement) {
              genderContentElement.classList.add('active');
          }
          if (sport === currentSport) {
              currentGender = gender;
          }
      });
  });

  // Form submission handling
  document.getElementById('add-fixture-form').addEventListener('submit', function (e) {
      e.preventDefault();

      if (!loggedInUser || loggedInUser.role !== 'admin') {
          alert('Only admins can add fixtures.');
          return;
      }

      const sport = document.getElementById('fixture-sport').value;
      const gender = document.getElementById('fixture-gender').value;
      const team1 = document.getElementById('fixture-team1').value;
      const team2 = document.getElementById('fixture-team2').value;
      const date = document.getElementById('fixture-date').value;
      const time = document.getElementById('fixture-time').value;
      const venue = document.getElementById('fixture-venue').value;
      const team1LogoUrl = document.getElementById('fixture-team1').selectedOptions[0].getAttribute('data-url');
      const team2LogoUrl = document.getElementById('fixture-team2').selectedOptions[0].getAttribute('data-url');

      // Validation
      if (team1 === team2) {
          alert('Teams cannot be the same.');
          return;
      }
      if (fixtures[sport][gender].some(f => f.team1 === team1 && f.team2 === team2 && f.date === date)) {
          alert('This matchup already exists on the same date.');
          return;
      }

      const newFixture = {
          team1,
          team2,
          date,
          time,
          venue,
          team1Logo: team1LogoUrl,
          team2Logo: team2LogoUrl,
          id: Date.now(),
          team1Score: '0',
          team2Score: '0',
          status: 'not_started'
      };

      fixtures[sport][gender].push(newFixture);
      localStorage.setItem('sportFixtures', JSON.stringify(fixtures));
      renderAllFixtures();
      this.reset();
      const addFixtureModal = bootstrap.Modal.getInstance(document.getElementById('addFixtureModal'));
      addFixtureModal.hide();
  });

  // Function to format date for display
  function formatDate(dateStr) {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString(undefined, options);
  }

  // Function to format time for display
  function formatTime(timeStr) {
      const [hours, minutes] = timeStr.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));
      return time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  // Function to get status badge
  function getStatusBadge(status) {
      switch (status) {
          case 'live':
              return '<span class="badge bg-success">Live</span>';
          case 'final':
              return '<span class="badge bg-secondary">Final</span>';
          default:
              return '<span class="badge bg-info">Not Started</span>';
      }
  }

  // Function to render all fixtures
  function renderAllFixtures() {
      const sports = ['football', 'volleyball', 'basketball', 'futsal'];
      const genders = ['mens', 'womens'];

      sports.forEach(sport => {
          genders.forEach(gender => {
              const container = document.getElementById(`${sport}-${gender}-fixtures`);
              if (container) {
                  if (fixtures[sport][gender].length === 0) {
                      container.innerHTML = `
                          <div class="col-12">
                              <div class="empty-state">
                                  <i class="fas fa-calendar-times"></i>
                                  <h5>No ${gender === 'mens' ? "Men's" : "Women's"} ${sport.charAt(0).toUpperCase() + sport.slice(1)} fixtures available</h5>
                                  <p>Click the "Add Fixture" button to add some matches!</p>
                              </div>
                          </div>
                      `;
                  } else {
                      container.innerHTML = fixtures[sport][gender].map((fixture, index) => `
                          <div class="col-md-4 mb-4">
                              <div class="card fixture-card">
                                  <div class="fixture-header ${sport}-header">
                                      <div class="fixture-header-overlay">
                                          ${loggedInUser && loggedInUser.role === 'admin' ? `
                                              <button class="delete-btn" data-sport="${sport}" data-gender="${gender}" data-index="${index}">
                                                  <i class="fas fa-trash"></i>
                                              </button>
                                              <button class="update-score-btn" data-sport="${sport}" data-gender="${gender}" data-index="${index}">
                                                  <i class="fas fa-pen"></i>
                                              </button>
                                          ` : ''}
                                          <div class="d-flex align-items-center mb-2">
                                              ${fixture.team1Logo ? `<img src="${fixture.team1Logo}" alt="${fixture.team1} logo" class="team-logo">` : ''}
                                              <h5 class="team-name">${fixture.team1} ${fixture.team1Score || '0'} - ${fixture.team2Score || '0'} ${fixture.team2}</h5>
                                              ${fixture.team2Logo ? `<img src="${fixture.team2Logo}" alt="${fixture.team2} logo" class="team-logo">` : ''}
                                          </div>
                                          <p class="mb-1">${getStatusBadge(fixture.status)}</p>
                                          <p class="mb-1"><i class="fas fa-calendar-alt fixture-details-icon"></i>${formatDate(fixture.date)}</p>
                                          <p class="mb-1"><i class="fas fa-clock fixture-details-icon"></i>${formatTime(fixture.time)}</p>
                                          <p class="mb-0"><i class="fas fa-map-marker-alt fixture-details-icon"></i>${fixture.venue}</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      `).join('');
                  }
              }
          });
      });

      const allFixturesContainer = document.getElementById('all-fixtures');
      if (allFixturesContainer) {
          const allFixtures = [];
          sports.forEach(sport => {
              genders.forEach(gender => {
                  fixtures[sport][gender].forEach((fixture, index) => {
                      allFixtures.push({ ...fixture, sport, gender, index });
                  });
              });
          });

          allFixtures.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

          if (allFixtures.length === 0) {
              allFixturesContainer.innerHTML = `
                  <div class="col-12">
                      <div class="empty-state">
                          <i class="fas fa-calendar-times"></i>
                          <h5>No fixtures available</h5>
                          <p>Click the "Add Fixture" button to add some matches!</p>
                      </div>
                  </div>
              `;
          } else {
              allFixturesContainer.innerHTML = allFixtures.map(fixture => `
                  <div class="col-md-4 mb-4">
                      <div class="card fixture-card">
                          <div class="fixture-header ${fixture.sport}-header">
                              <div class="fixture-header-overlay">
                                  ${loggedInUser && loggedInUser.role === 'admin' ? `
                                      <button class="delete-btn" data-sport="${fixture.sport}" data-gender="${fixture.gender}" data-index="${fixture.index}">
                                          <i class="fas fa-trash"></i>
                                      </button>
                                      <button class="update-score-btn" data-sport="${fixture.sport}" data-gender="${fixture.gender}" data-index="${fixture.index}">
                                          <i class="fas fa-pen"></i>
                                      </button>
                                  ` : ''}
                                  <div class="d-flex align-items-center mb-2">
                                      ${fixture.team1Logo ? `<img src="${fixture.team1Logo}" alt="${fixture.team1} logo" class="team-logo">` : ''}
                                      <h5 class="team-name">${fixture.team1} ${fixture.team1Score || '0'} - ${fixture.team2Score || '0'} ${fixture.team2}</h5>
                                      ${fixture.team2Logo ? `<img src="${fixture.team2Logo}" alt="${fixture.team2} logo" class="team-logo">` : ''}
                                  </div>
                                  <p class="mb-1">${getStatusBadge(fixture.status)}</p>
                                  <p class="mb-1"><i class="fas fa-calendar-alt fixture-details-icon"></i>${formatDate(fixture.date)}</p>
                                  <p class="mb-1"><i class="fas fa-clock fixture-details-icon"></i>${formatTime(fixture.time)}</p>
                                  <p class="mb-1"><i class="fas fa-map-marker-alt fixture-details-icon"></i>${fixture.venue}</p>
                                  <p class="mb-0"><i class="fas fa-tag fixture-details-icon"></i>${fixture.sport.charAt(0).toUpperCase() + fixture.sport.slice(1)} (${fixture.gender === 'mens' ? "Men's" : "Women's"})</p>
                              </div>
                          </div>
                      </div>
                  </div>
              `).join('');
          }
      }

      // Add event listeners for delete buttons
      document.querySelectorAll('.delete-btn').forEach(button => {
          button.addEventListener('click', function (e) {
              e.stopPropagation();
              const sport = this.getAttribute('data-sport');
              const gender = this.getAttribute('data-gender');
              const index = parseInt(this.getAttribute('data-index'), 10);
              fixtureToDelete = { sport, gender, index };
              deleteConfirmModal.show();
          });
      });

      // Add event listeners for score update buttons
      document.querySelectorAll('.update-score-btn').forEach(button => {
          button.addEventListener('click', function (e) {
              e.stopPropagation();
              const sport = this.getAttribute('data-sport');
              const gender = this.getAttribute('data-gender');
              const index = parseInt(this.getAttribute('data-index'), 10);
              fixtureToUpdateScore = { sport, gender, index };

              // Populate score update modal
              const fixture = fixtures[sport][gender][index];
              document.getElementById('score-team1-name').textContent = fixture.team1;
              document.getElementById('score-team2-name').textContent = fixture.team2;
              document.getElementById('score-team1-logo').src = fixture.team1Logo || '';
              document.getElementById('score-team2-logo').src = fixture.team2Logo || '';
              document.getElementById('team1-score').value = fixture.team1Score || '0';
              document.getElementById('team2-score').value = fixture.team2Score || '0';
              document.getElementById('match-status').value = fixture.status || 'not_started';

              updateScoreModal.show();
          });
      });
  }
});