document.addEventListener('DOMContentLoaded', () => {
  // Retrieve UI elements
  const longBreakEnabled = document.getElementById('longBreakEnabled');
  const longBreakInterval = document.getElementById('longBreakInterval');
  const longBreakDuration = document.getElementById('longBreakDuration');
  const notifyBeforeLongBreak = document.getElementById('notifyBeforeLongBreak');
  const notifyBeforeInterval = document.getElementById('notifyBeforeInterval');
  const shortBreakEnabled = document.getElementById('shortBreakEnabled');
  const shortBreakInterval = document.getElementById('shortBreakInterval');
  const enableSounds = document.getElementById('enableSounds');
  const strictMode = document.getElementById('strictMode');
  const tryShortBreak = document.getElementById('tryShortBreak');
  const tryLongBreak = document.getElementById('tryLongBreak');
  const saveSettings = document.getElementById('saveSettings');

  // Save settings function
  function saveSettingsToLocalStorage() {
    const settings = {
      longBreakEnabled: longBreakEnabled.checked,
      longBreakInterval: longBreakInterval.value,
      longBreakDuration: longBreakDuration.value,
      notifyBeforeLongBreak: notifyBeforeLongBreak.checked,
      notifyBeforeInterval: notifyBeforeInterval.value,
      shortBreakEnabled: shortBreakEnabled.checked,
      shortBreakInterval: shortBreakInterval.value,
      enableSounds: enableSounds.checked,  
      strictMode: strictMode.checked,
    };
    localStorage.setItem('reminderSettings', JSON.stringify(settings));
    alert('Settings saved!');
  }

  // Load settings
  function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('reminderSettings')) || {};
    longBreakEnabled.checked = settings.longBreakEnabled || false;
    longBreakInterval.value = settings.longBreakInterval || '40 minutes';
    longBreakDuration.value = settings.longBreakDuration || '5 minutes';
    notifyBeforeLongBreak.checked = settings.notifyBeforeLongBreak || false;
    notifyBeforeInterval.value = settings.notifyBeforeInterval || '2 minutes';
    shortBreakEnabled.checked = settings.shortBreakEnabled || false;
    shortBreakInterval.value = settings.shortBreakInterval || '8 minutes';
    enableSounds.checked = settings.enableSounds || false;
    strictMode.checked = settings.strictMode || false;
  }

  // Event listeners
  saveSettings.addEventListener('click', saveSettingsToLocalStorage);

  tryShortBreak.addEventListener('click', () => alert('Starting short break...'));
  tryLongBreak.addEventListener('click', () => alert('Starting long break...'));


  // List of Eye Exercises
  const eyeExercises = [
    "Blink fast for 10 seconds to refresh your eyes!",
    "Close your eyes and gently press your palms over them for 30 seconds.",
    "Look 20 feet away for 20 seconds—relax your focus!",
    "Roll your eyes in circles—5 times clockwise, then counterclockwise.",
    "Shift focus—look at your thumb, then something far away. Repeat 5 times.",
    "Massage around your eyes gently with your fingertips.",
    "Close your eyes tightly, then open wide—repeat 5 times.",
    "Trace an imaginary figure 8 with your eyes for 30 seconds.",
    "Look left, then right—then up and down. Repeat 10 times.",
    "Blink slowly 10 times to hydrate your eyes."
  ];

  // Notification Elements
  const notification = document.getElementById('shortBreakNotification');
  const exerciseTip = document.getElementById('exerciseTip');
  const dismissNotification = document.getElementById('dismissNotification');

  // Show Notification with Random Exercise
  function showNotification() {
    const randomExercise = eyeExercises[Math.floor(Math.random() * eyeExercises.length)];
    exerciseTip.innerText = randomExercise;
    notification.classList.remove('hidden');
  }

  // Hide Notification
  function hideNotification() {
    notification.classList.add('hidden');
  }

  // Schedule Short Break Reminders
  function scheduleShortBreaks(intervalInMinutes) {
    const intervalInMs = intervalInMinutes * 60 * 1000; // Convert to milliseconds
    setInterval(() => {
      showNotification();
    }, intervalInMs);
  }

  // Event Listener for Dismissing Notification
  dismissNotification.addEventListener('click', hideNotification);

  // Start Short Break Reminders
  const defaultShortBreakInterval = 8; // Default interval (minutes)
  scheduleShortBreaks(defaultShortBreakInterval);
  
  tryShortBreak.addEventListener('click', () => {
    showNotification(); // Trigger notification for testing
  });


  // Initialize settings on load
  loadSettings();
});
