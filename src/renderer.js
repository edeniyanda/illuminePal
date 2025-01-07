document.addEventListener('DOMContentLoaded', () => {
    // Sidebar Toggle Elements
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburger');
    const mainContent = document.querySelector('.main-content');
  
    // Toggle Sidebar Open/Close
    hamburger.addEventListener('click', () => {
      // Toggle the 'closed' class
      sidebar.classList.toggle('closed');
  
      // Dynamically adjust content margin based on sidebar state
      if (sidebar.classList.contains('closed')) {
        mainContent.style.marginLeft = '70px'; // Adjust margin
        hamburger.style.left = '90px'; // Move hamburger closer
      } else {
        mainContent.style.marginLeft = '250px'; // Expand content area
        hamburger.style.left = '270px'; // Move hamburger back
      }
    });
  
    // Menu Navigation
    const menuItems = document.querySelectorAll('.menu-item');
    const sections = document.querySelectorAll('.section');
  
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const sectionId = item.getAttribute('data-section');
  
        // Remove 'active' from all menu items and sections
        menuItems.forEach(i => i.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
  
        // Activate clicked section
        item.classList.add('active');
        document.getElementById(sectionId).classList.add('active');
      });
    });
    document.getElementById('setReminderBtn').addEventListener('click', () => {
      window.electronAPI.sendMessage('navigate-to', 'reminders');
    });
    
    document.getElementById('startExerciseBtn').addEventListener('click', () => {
      window.electronAPI.sendMessage('navigate-to', 'exercises');
    });
    
    document.getElementById('viewAnalyticsBtn').addEventListener('click', () => {
      window.electronAPI.sendMessage('navigate-to', 'analytics');
    });
    
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
  