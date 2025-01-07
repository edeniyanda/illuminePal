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

  // Initialize settings on load
  loadSettings();
});
