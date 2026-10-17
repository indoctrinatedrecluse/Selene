use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct DesktopInfo {
    pub name: String,
    pub version: String,
    pub os: String,
    pub is_desktop: bool,
}

#[tauri::command]
fn get_desktop_info() -> DesktopInfo {
    DesktopInfo {
        name: "Selene".into(),
        version: env!("CARGO_PKG_VERSION").into(),
        os: std::env::consts::OS.into(),
        is_desktop: true,
    }
}

#[tauri::command]
fn read_document_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

#[tauri::command]
fn write_document_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, content).map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            get_desktop_info,
            read_document_file,
            write_document_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running Selene desktop application");
}
