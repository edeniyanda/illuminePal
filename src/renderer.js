document.addEventListener('DOMContentLoaded', () => {
     // Sidebar and Section Management
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const mainContent = document.querySelector('.main-content');
  const menuItems = document.querySelectorAll('.menu-item');
  const sections = document.querySelectorAll('.section');

  // Toggle Sidebar Open/Close
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('closed');
    mainContent.style.marginLeft = sidebar.classList.contains('closed') ? '70px' : '250px';
  });

  // Menu Navigation
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const sectionId = item.getAttribute('data-section');

      // Highlight active menu item
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Show the selected section
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(sectionId).classList.add('active');
    });
  });

  // Home Page Buttons Navigation
  document.getElementById('setReminderBtn').addEventListener('click', () => {
    navigateToSection('reminders');
  });

  document.getElementById('startExerciseBtn').addEventListener('click', () => {
    navigateToSection('exercises');
  });

  document.getElementById('viewAnalyticsBtn').addEventListener('click', () => {
    navigateToSection('analytics');
  });

  // Function to Switch Sections
  function navigateToSection(sectionId) {
    // Highlight menu item
    menuItems.forEach(item => {
      if (item.getAttribute('data-section') === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Display the selected section
    sections.forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
  }
    // Streak Logic
    const streakKey = 'eyeCareStreak';
    const lastUsedKey = 'lastUsedDate';

    // Get stored data
    let streakCount = parseInt(localStorage.getItem(streakKey)) || 0;
    const lastUsedDate = localStorage.getItem(lastUsedKey) || null;
    const today = new Date().toDateString();

    // Function to update the streak
    function updateStreak() {
      if (lastUsedDate === today) {
        // User already logged in today
        document.getElementById('streakCount').innerText = streakCount;
      } else {
        const lastDate = new Date(lastUsedDate);
        const todayDate = new Date(today);

        const diff = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
          // Increment streak if it's the next day
          streakCount++;
        } else if (diff > 1) {
          // Reset streak if the gap is more than a day
          streakCount = 1;
        }

        // Update values
        localStorage.setItem(streakKey, streakCount);
        localStorage.setItem(lastUsedKey, today);
        document.getElementById('streakCount').innerText = streakCount;
      }
    }

    // Initialize streak count
    updateStreak();

    // Buttons for quick navigation
    document.getElementById('setReminderBtn').addEventListener('click', () => {
      window.electronAPI.sendMessage('navigate-to', 'reminders');
    });

    document.getElementById('startExerciseBtn').addEventListener('click', () => {
      window.electronAPI.sendMessage('navigate-to', 'exercises');
    });

    document.getElementById('viewAnalyticsBtn').addEventListener('click', () => {
      window.electronAPI.sendMessage('navigate-to', 'analytics');
    });

});
  