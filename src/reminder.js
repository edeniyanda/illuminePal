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

  // tryShortBreak.addEventListener('click', () => alert('Starting short break...'));
  // tryLongBreak.addEventListener('click', () => alert('Starting long break...'));


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
  
  function showPopupNotification() {
    const randomExercise = eyeExercises[Math.floor(Math.random() * eyeExercises.length)];
    window.electronAPI.send('show-popup', randomExercise); // Send to main process
    console.log('Popup triggered with:', randomExercise); // Debugging
  }

  // Timer Countdown Function
  function scheduleShortBreaks(intervalInMinutes) {
    const interval = parseInt(intervalInMinutes);

    // Validate input
    if (isNaN(interval) || interval <= 0) {
      alert('Invalid interval. Please enter a valid time in minutes.');
      return;
    }

    const intervalInMs = interval * 60 * 1000; // Convert minutes to milliseconds

    console.log(`Short break reminder scheduled in ${interval} minutes.`);

    // Set timeout for the reminder
    setTimeout(() => {
      showPopupNotification(); // Trigger the popup
    }, intervalInMs);
  } 

  
  // ========================
  // Long Break Functionality
  function scheduleLongBreak(intervalInMinutes, durationInMinutes, notifyBefore) {
    const notifyBeforeMs = notifyBefore * 60 * 1000; // Notify time in milliseconds
    const intervalMs = intervalInMinutes * 60 * 1000; // Interval time in milliseconds
    const durationMs = durationInMinutes * 60 * 1000; // Duration time in milliseconds

    console.log(`Long break scheduled in ${intervalInMinutes} minutes.`);

    // Pre-inform the user before the break
    // setTimeout(() => {        
    //   window.electronAPI.send('show-preinform', "Hello"); // Trigger pre-inform window
    //   console.log("Made it here");
    // }, intervalInMs - notifyBeforeMs); // Notify before actual break time

    // Start the long break
    setTimeout(() => {
      window.electronAPI.send('start-long-break', durationMs); // Trigger long break window
      console.log("Let the break Begins")
    }, intervalMs); // Actual break time
  }
  
  // ========================
  // Button Handlers

  // Event Listener for Short Break Button
  tryShortBreak.addEventListener('click', () => {
    if (!shortBreakEnabled.checked) {
      alert('Short breaks are disabled. Enable them in Reminder settings.');
      return;
    }
    console.log('Starting short break...');
    scheduleShortBreaks(shortBreakInterval.value); // Use user input
  });

  tryLongBreak.addEventListener('click', () => {
    console.log('Starting long break...');
    const interval = parseInt(longBreakInterval.value);
    const duration = parseInt(longBreakDuration.value);
    const notifyBefore = parseInt(notifyBeforeInterval.value);
    
    scheduleLongBreak(interval, duration, notifyBefore);
  });
  
  console.log('Reminder script loaded successfully!');
  // Initialize settings on load
  loadSettings();
});
