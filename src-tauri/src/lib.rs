mod models;
mod engine;
mod commands;

use commands::{scan_directory, get_cocomo_estimate, export_report};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan_directory,
            get_cocomo_estimate,
            export_report
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


