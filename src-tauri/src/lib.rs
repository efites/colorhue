use tauri::{Manager, State, Window};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Size {
    width: f64,
    height: f64,
}

#[tauri::command]
async fn resize_window(window: Window, size: Size) -> Result<(), String> {
    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize {
            width: size.width,
            height: size.height,
        }))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn set_window_size(window: Window, width: f64, height: f64) -> Result<(), String> {
    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
        .map_err(|e| e.to_string())?;
    
    window.show().map_err(|e| e.to_string())?;

    Ok(())
}


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![set_window_size])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
