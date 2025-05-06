use serde::{Serialize, Deserialize};
use std::{fs, path::PathBuf};
use directories::ProjectDirs;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppSettings {
    pub short_break_minutes: u32,
    pub long_break_minutes: u32,
    pub notifications_enabled: bool,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            short_break_minutes: 5,
            long_break_minutes: 15,
            notifications_enabled: true,
        }
    }
}

impl AppSettings {
    pub fn load() -> Self {
        let path = settings_path();
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(parsed) = serde_json::from_str(&data) {
                return parsed;
            }
        }
        // fallback to default
        let default = AppSettings::default();
        default.save(); // save default for first run
        default
    }

    pub fn save(&self) {
        let path = settings_path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).ok();
        }
        if let Ok(json) = serde_json::to_string_pretty(self) {
            fs::write(path, json).ok();
        }
    }
}

fn settings_path() -> PathBuf {
    ProjectDirs::from("com", "illuminepal", "illuminePal")
        .expect("no valid project dir")
        .config_dir()
        .join("settings.json")
}
