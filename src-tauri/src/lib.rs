use tauri::{AppHandle, Emitter, Manager, WebviewUrl, WebviewWindowBuilder, Window};
use serde_json::json;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use image::codecs::png::PngEncoder;
use image::{ColorType, ExtendedColorType, ImageEncoder};
use screenshots::Screen;
use serde::Serialize;

#[derive(Serialize)]
struct CaptureData {
    color: String,
    image: String, // data:image/png;base64,<...>
    width: u32,
    height: u32,
}


#[tauri::command]
fn set_window_size(window: Window, width: f64, height: f64) -> Result<(), String> {
    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
        .map_err(|e| e.to_string())?;

    Ok(())
}


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn show_window(window: Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn exit_app() {
    std::process::exit(0);
}

#[tauri::command]
fn minimize_window(app_handle: AppHandle) {
    let window = app_handle.get_webview_window("main").unwrap();
    window.minimize().unwrap();
}

#[tauri::command]
async fn create_overlay(app_handle: tauri::AppHandle, window_name: &str) -> Result<(), String> {
    // Получаем информацию о всех экранах
    let screens = app_handle.primary_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("No primary monitor found")?;

    let screen_size = screens.size();

    // Создаем overlay окно на весь экран
    let overlay = WebviewWindowBuilder::new(
        &app_handle,
        window_name,
        WebviewUrl::App("./src/overlays/picker.html".into()) // тот же HTML, но с другим компонентом
    )
    .fullscreen(false)
    .transparent(false) // Прозрачное окно
    .decorations(false) // Без рамки
    .always_on_top(true) // Поверх всех окон
    .focused(true)
    .build()
    .map_err(|e| e.to_string())?;

    // Устанавливаем прозрачность и игнорирование событий мыши для определенных областей
    overlay.set_ignore_cursor_events(false)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn send_cursor_position(
    app_handle: tauri::AppHandle,
    x: i32,
    y: i32,
) -> Result<(), String> {
    // Отправляем данные в основное окно через событие
    app_handle.emit_to("main", "send_cursor_position", Some(json!({"x": x, "y": y})))
        .map_err(|e| e.to_string())?;

    Ok(())
}

// Команда для закрытия overlay
#[tauri::command]
async fn close_overlay(app_handle: tauri::AppHandle, window_name: &str) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window(window_name) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn capture_cursor_area(x: i32, y: i32, size: Option<u32>) -> Result<CaptureData, String> {
    let radius: u32 = size.unwrap_or(50);
    if radius == 0 {
        return Err("size must be > 0".to_string());
    }

    let screen = Screen::from_point(x, y).map_err(|e| e.to_string())?;

    let half = (radius / 2) as i32;
    let left = x - half;
    let top = y - half;
    let width = radius;
    let height = radius;

    let image = screen
        .capture_area(left, top, width, height)
        .map_err(|e| e.to_string())?;

    let w = image.width();
    let h = image.height();
    let rgba = image.into_raw();

    // Center pixel color
    let cx = (w / 2).min(w.saturating_sub(1));
    let cy = (h / 2).min(h.saturating_sub(1));
    let idx = ((cy * w + cx) * 4) as usize;
    let r = rgba[idx + 0];
    let g = rgba[idx + 1];
    let b = rgba[idx + 2];
    let _a = rgba[idx + 3];
    let color_hex = format!("#{:02X}{:02X}{:02X}", r, g, b);

    let mut png_bytes: Vec<u8> = Vec::with_capacity((w * h) as usize);
    {
        let encoder = PngEncoder::new(&mut png_bytes);
        encoder
            .write_image(&rgba, w, h, ExtendedColorType::Rgba8)
            .map_err(|e| e.to_string())?;
    }

    let base64_png = STANDARD.encode(&png_bytes);
    let data_url = format!("data:image/png;base64,{}", base64_png);

    Ok(CaptureData {
        color: color_hex,
        image: data_url,
        width: w,
        height: h,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            set_window_size,
            exit_app,
            minimize_window,
            show_window,
            capture_cursor_area,
            create_overlay,
            close_overlay,
            send_cursor_position,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
