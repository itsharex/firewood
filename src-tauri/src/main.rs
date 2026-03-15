// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Manager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

fn show_window(app: &tauri::AppHandle) {
    #[cfg(target_os = "macos")]
    let _ = app.show();
    if let Some(window) = app.get_window("main") {
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn main() {
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    let app = tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                show_window(app);
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "show" => {
                    show_window(app);
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                let app = event.window().app_handle();
                #[cfg(target_os = "macos")]
                let _ = app.hide();
                #[cfg(not(target_os = "macos"))]
                let _ = event.window().hide();
                api.prevent_close();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, event| {
        if let RunEvent::ExitRequested { api, .. } = event {
            api.prevent_exit();
        }
    });
}
