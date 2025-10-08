use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder, Window};
use serde_json::json;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use image::codecs::png::PngEncoder;
use image::{ExtendedColorType, ImageEncoder};
use screenshots::Screen;
use serde::Serialize;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use tauri::async_runtime as tauri_rt;
use device_query::{DeviceQuery, DeviceState};

#[derive(Serialize)]
struct CaptureData {
    color: String,
    image: String, // data:image/png;base64,<...>
    width: u32,
    height: u32,
}

struct CaptureStreamState {
    is_running: AtomicBool,
    handle: Mutex<Option<tauri_rt::JoinHandle<()>>>,
    last_image: Mutex<Option<String>>, // data URL to avoid duplicate emits
    capture_size: Mutex<u32>,
    fps: Mutex<u32>,
}

impl CaptureStreamState {
    fn new() -> Self {
        Self {
            is_running: AtomicBool::new(false),
            handle: Mutex::new(None),
            last_image: Mutex::new(None),
            capture_size: Mutex::new(50),
            fps: Mutex::new(12),
        }
    }
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
    // Создаем overlay окно на весь экран
    let overlay = WebviewWindowBuilder::new(
        &app_handle,
        window_name,
        WebviewUrl::App("./src/overlays/picker.html".into()) // тот же HTML, но с другим компонентом
    )
    .fullscreen(true)
    .transparent(true) // Прозрачное окно
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
    size: Option<u32>,
) -> Result<(), String> {
    // Отправляем данные в основное окно через событие
    app_handle.emit_to("main", "send_cursor_position", Some(json!({"x": x, "y": y, "size": size })))
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
    capture_at(x, y, size)
}

fn capture_at(x: i32, y: i32, size: Option<u32>) -> Result<CaptureData, String> {
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

#[tauri::command]
fn start_capture_stream(
    app_handle: AppHandle,
    state: State<Arc<CaptureStreamState>>,
    window_name: &str,
    fps: Option<u32>,
    size: Option<u32>,
) -> Result<(), String> {
    if state.is_running.swap(true, Ordering::SeqCst) {
        return Ok(()); // already running
    }

    // Clamp and store initial parameters
    const MIN_FPS: u32 = 5;
    const MAX_FPS: u32 = 60;

    let mut fps_lock = state.fps.lock().map_err(|e| e.to_string())?;
    *fps_lock = fps.map(|f| f.clamp(MIN_FPS, MAX_FPS)).unwrap_or(12);
    drop(fps_lock);

    if let Some(sz) = size {
        let mut size_lock = state.capture_size.lock().map_err(|e| e.to_string())?;
        *size_lock = sz.clamp(10, 50);
    }

    let mut interval_ms = {
        let fps_cur = *state.fps.lock().map_err(|e| e.to_string())?;
        (1000 / fps_cur.max(1)) as u64
    };
    let app_handle_clone = app_handle.clone();
    let window_name_owned = window_name.to_string();
    let state_clone = state.inner().clone();

    let handle = tauri_rt::spawn_blocking(move || {
        let device_state = DeviceState::new();
        let mut last_tick = std::time::Instant::now();
        let mut frames_since_adjust: u32 = 0;

        while state_clone.is_running.load(Ordering::SeqCst) {
            let elapsed = last_tick.elapsed();
            if elapsed.as_millis() as u64 >= interval_ms {
                last_tick = std::time::Instant::now();

                let mouse = device_state.get_mouse();
                let (x, y) = mouse.coords;
                let size_cur = *state_clone.capture_size.lock().unwrap();
                let frame_start = std::time::Instant::now();
                if let Ok(data) = capture_at(x as i32, y as i32, Some(size_cur)) {
                    let mut last = state_clone.last_image.lock().unwrap();
                    if last.as_ref().map(|s| s.as_str()) != Some(data.image.as_str()) {
                        *last = Some(data.image.clone());
                        let _ = app_handle_clone.emit_to(
                            &window_name_owned,
                            "picker_frame",
                            Some(json!({
                                "image": data.image,
                                "color": data.color,
                                "width": data.width,
                                "height": data.height,
                            })),
                        );
                    }
                }

                // Adaptive FPS adjustment based on processing time
                let process_ms = frame_start.elapsed().as_millis() as u64;
                frames_since_adjust += 1;
                if frames_since_adjust >= 5 {
                    frames_since_adjust = 0;
                    let mut fps_lock = state_clone.fps.lock().unwrap();
                    let mut fps_val = *fps_lock;
                    // If processing exceeds current interval notably, decrease FPS
                    if process_ms > interval_ms {
                        // drop by 2 fps steps
                        if fps_val > MIN_FPS { fps_val = fps_val.saturating_sub(2); }
                    } else if process_ms * 2 + 2 < interval_ms {
                        // If we have a lot of headroom, increase FPS by 1
                        if fps_val < MAX_FPS { fps_val = fps_val.saturating_add(1); }
                    }
                    *fps_lock = fps_val;
                    interval_ms = (1000 / fps_val.max(1)) as u64;
                }
            }

            std::thread::sleep(std::time::Duration::from_millis(4));
        }
    });

    *state.handle.lock().map_err(|e| e.to_string())? = Some(handle);
    Ok(())
}

#[tauri::command]
fn stop_capture_stream(state: State<Arc<CaptureStreamState>>) -> Result<(), String> {
    state.is_running.store(false, Ordering::SeqCst);
    // We don't join the handle to avoid blocking; it will finish on its own.
    Ok(())
}

#[tauri::command]
fn update_capture_size(state: State<Arc<CaptureStreamState>>, size: u32) -> Result<(), String> {
    let mut lock = state.capture_size.lock().map_err(|e| e.to_string())?;
    *lock = size.clamp(10, 50);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(CaptureStreamState::new()))
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
            start_capture_stream,
            stop_capture_stream,
            update_capture_size,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
