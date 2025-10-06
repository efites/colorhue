use tauri::{Manager, Window, AppHandle};
use serde::Deserialize;
use base64::{Engine as _, engine::general_purpose::STANDARD};
use screenshots::Screen;

#[derive(Deserialize)]
pub struct Size {
    width: f64,
    height: f64,
}

#[derive(serde::Serialize)]
struct CaptureData {
    color: String,
    image_data: Vec<u8>, // Готовые PNG данные
    width: u32,
    height: u32,
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
async fn capture_cursor_area(x: i32, y: i32) -> Result<CaptureData, String> {
    let screens = Screen::all().map_err(|e| e.to_string())?;

    for screen in screens {
        let screen_x = screen.display_info.x;
        let screen_y = screen.display_info.y;
        let screen_width = screen.display_info.width as i32;
        let screen_height = screen.display_info.height as i32;

        if screen_x <= x && x < screen_x + screen_width &&
            screen_y <= y && y < screen_y + screen_height {

            let capture_x = (x - screen_x - 25).max(0) as u32;
            let capture_y = (y - screen_y - 25).max(0) as u32;
            let width = 50u32;
            let height = 50u32;

            let actual_width = width.min(screen.display_info.width - capture_x);
            let actual_height = height.min(screen.display_info.height - capture_y);

            if actual_width == 0 || actual_height == 0 {
                continue;
            }

            // Используем прямое захватывание области
            let image = screen.capture_area(capture_x as i32, capture_y as i32, actual_width, actual_height)
                .map_err(|e| e.to_string())?;

            // Получаем PNG данные
            let png_buffer = image.as_raw().clone();

            // Для цвета используем быстрый метод
            let color = extract_color_fast(&image)?;

            return Ok(CaptureData {
                color,
                image_data: png_buffer,
                width: actual_width,
                height: actual_height,
            });
        }
    }

    Err("Cursor outside screens".to_string())
}

fn extract_color_fast(image: &screenshots::image::RgbaImage) -> Result<String, String> {
    // Быстрый метод: используем библиотеку image для декодирования только центрального пикселя
    use image::ImageReader;
    use std::io::Cursor;

    let png_data = image.as_raw().clone();
    let decoder = ImageReader::new(Cursor::new(png_data))
        .with_guessed_format()
        .map_err(|e| e.to_string())?
        .decode()
        .map_err(|e| e.to_string())?;

    let rgb = decoder.to_rgb8();
    let center_x = rgb.width() / 2;
    let center_y = rgb.height() / 2;
    let pixel = rgb.get_pixel(center_x, center_y);

    Ok(format!("#{:02x}{:02x}{:02x}", pixel[0], pixel[1], pixel[2]))
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
            capture_cursor_area
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
