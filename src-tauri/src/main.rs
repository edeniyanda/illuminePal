// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod settings;

use settings::AppSettings;
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    WindowEvent,
};

#[tauri::command]
fn load_settings() -> AppSettings {
    AppSettings::load()
}

#[tauri::command]
fn save_settings(new_settings: AppSettings) {
    new_settings.save();
}

fn main() {
    // Build System Tray Menu
    const QUIT_ITEM_ID: &str = "quit";
    const SHOW_ITEM_ID: &str = "show";

    let quit = CustomMenuItem::new(QUIT_ITEM_ID, "Quit IlluminePal");
    let show = CustomMenuItem::new(SHOW_ITEM_ID, "Show IlluminePal");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                QUIT_ITEM_ID => {
                    std::process::exit(0);
                }
                SHOW_ITEM_ID => {
                    if let Some(window) = app.get_window("main") {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                _ => {}
            },
            SystemTrayEvent::DoubleClick { .. } => {
                if let Some(window) = app.get_window("main") {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            _ => {}
        })
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                let settings = AppSettings::load();
                if settings.background_timer_enabled {
                    // Prevent closing window and hide to system tray instead
                    api.prevent_close();
                    event.window().hide().unwrap();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![load_settings, save_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
