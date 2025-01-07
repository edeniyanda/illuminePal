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
    
});
  