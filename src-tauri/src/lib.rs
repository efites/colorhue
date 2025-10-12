use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder, Window};
use serde_json::json;
use once_cell::sync::OnceCell;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use image::codecs::png::PngEncoder;
use image::{ExtendedColorType, ImageEncoder};
use screenshots::Screen;
use serde::Serialize;
use std::path::Path;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use tauri::async_runtime as tauri_rt;
use device_query::{DeviceQuery, DeviceState};
use std::fs;
use serde::Deserialize;

#[derive(Serialize)]
struct CaptureData {
    color: String,
    image: String, // data:image/png;base64,<...>
    width: u32,
    height: u32,
    formatted: Option<String>,
    format: Option<String>,
}

struct CaptureStreamState {
    is_running: AtomicBool,
    handle: Mutex<Option<tauri_rt::JoinHandle<()>>>,
    last_image: Mutex<Option<String>>, // data URL to avoid duplicate emits
    capture_size: Mutex<u32>,
    fps: Mutex<u32>,
    color_format: Mutex<String>,
    min_size: Mutex<u32>,
    max_size: Mutex<u32>,
}

static APP_CONFIG: OnceCell<Mutex<Option<AppConfig>>> = OnceCell::new();

impl CaptureStreamState {
    fn new() -> Self {
        Self {
            is_running: AtomicBool::new(false),
            handle: Mutex::new(None),
            last_image: Mutex::new(None),
            capture_size: Mutex::new(50),
            fps: Mutex::new(12),
            color_format: Mutex::new("hex".to_string()),
            min_size: Mutex::new(10),
            max_size: Mutex::new(50),
        }
    }
}


#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AppConfig {
    pub mode: String,
    pub pipette: PipetteConfig,
    pub overlay: Option<Overlay>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct PipetteConfig {
    pub min: i32,
    pub max: i32,
    pub default: i32,
    pub step: i32,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Overlay {
    pub width: i32,
    pub height: i32,
}

pub fn init_config(config: AppConfig) -> Result<(), String> {
    let cell = APP_CONFIG.get_or_init(|| Mutex::new(None));

    let mut config_guard = cell.lock().map_err(|e| e.to_string())?;
    if config_guard.is_some() {
        return Err("Config already initialized".to_string());
    }

    *config_guard = Some(config);
    Ok(())
}

pub fn get_config() -> Result<AppConfig, String> {
    let cell = APP_CONFIG
        .get()
        .ok_or("Config not initialized".to_string())?;

    let config_guard = cell.lock().map_err(|e| e.to_string())?;
    config_guard
        .as_ref()
        .cloned()
        .ok_or("Config not initialized".to_string())
}

pub fn setup_config() -> Result<(), String> {
    // В разработке config.json в корне проекта, в production - рядом с исполняемым файлом
    let config_path = if cfg!(debug_assertions) {
        "../config.json"
    } else {
        "./config.json"
    };

    let config_content = fs::read_to_string(Path::new(config_path))
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let config: AppConfig = serde_json::from_str(&config_content)
        .map_err(|e| format!("Failed to parse config JSON: {}", e))?;

    init_config(config)
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
	let config = get_config()?;

    let build_mode = config.mode;
    let mut builder = WebviewWindowBuilder::new(
        &app_handle,
        window_name,
        WebviewUrl::App("./src/overlays/picker.html".into())
    )
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .focused(true)
    .visible(false); // Создаём невидимым, показываем после загрузки

    if build_mode == "dev" {
		let sizes = config.overlay.unwrap_or(Overlay {width: 150, height: 250});
		let width: f64 = sizes.width as f64;
		let height: f64 = sizes.height as f64;

		builder = builder.inner_size(width, height);
    } else {
        builder = builder.fullscreen(true);
    }

    let overlay = builder.build().map_err(|e| e.to_string())?;
    overlay.set_ignore_cursor_events(false).map_err(|e| e.to_string())?;

    // Показываем окно сразу, но с прозрачным фоном
    overlay.show().map_err(|e| e.to_string())?;

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
fn capture_cursor_area(x: i32, y: i32, size: Option<u32>, format: Option<String>) -> Result<CaptureData, String> {
    capture_at(x, y, size, format)
}

fn capture_at(x: i32, y: i32, size: Option<u32>, format: Option<String>) -> Result<CaptureData, String> {
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

    // Simple mock formatting: support "hex" (default) and "rgb"
    let fmt = format.unwrap_or_else(|| "hex".to_string());
    let formatted = match fmt.as_str() {
        "rgb" => Some(format!("rgb({}, {}, {})", r, g, b)),
        _ => Some(color_hex.clone()),
    };

    Ok(CaptureData {
        color: color_hex,
        image: data_url,
        width: w,
        height: h,
        formatted,
        format: Some(fmt),
    })
}

#[tauri::command]
fn start_capture_stream(
    app_handle: AppHandle,
    state: State<Arc<CaptureStreamState>>,
    window_name: &str,
    fps: Option<u32>,
    size: Option<u32>,
    format: Option<String>,
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
        let min_sz = *state.min_size.lock().map_err(|e| e.to_string())?;
        let max_sz = *state.max_size.lock().map_err(|e| e.to_string())?;
        let mut size_lock = state.capture_size.lock().map_err(|e| e.to_string())?;
        *size_lock = sz.clamp(min_sz, max_sz);
    }
    if let Some(fmt) = &format {
        let mut fmt_lock = state.color_format.lock().map_err(|e| e.to_string())?;
        *fmt_lock = fmt.clone();
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
                let fmt_cur = state_clone.color_format.lock().unwrap().clone();
                let frame_start = std::time::Instant::now();
                if let Ok(data) = capture_at(x as i32, y as i32, Some(size_cur), Some(fmt_cur)) {
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
                                "formatted": data.formatted,
                                "format": data.format,
                                "x": x,
                                "y": y,
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
    let min_sz = *state.min_size.lock().map_err(|e| e.to_string())?;
    let max_sz = *state.max_size.lock().map_err(|e| e.to_string())?;
    let mut lock = state.capture_size.lock().map_err(|e| e.to_string())?;
    *lock = size.clamp(min_sz, max_sz);
    Ok(())
}

#[tauri::command]
fn update_color_format(state: State<Arc<CaptureStreamState>>, format: Option<String>) -> Result<(), String> {
    let mut lock = state.color_format.lock().map_err(|e| e.to_string())?;
    *lock = format.unwrap_or_else(|| "hex".to_string());
    Ok(())
}

#[tauri::command]
fn update_capture_limits(state: State<Arc<CaptureStreamState>>, min_size: u32, max_size: u32) -> Result<(), String> {
    if min_size == 0 || max_size == 0 || min_size > max_size { return Err("invalid limits".to_string()); }
    {
        let mut min_lock = state.min_size.lock().map_err(|e| e.to_string())?;
        *min_lock = min_size;
    }
    {
        let mut max_lock = state.max_size.lock().map_err(|e| e.to_string())?;
        *max_lock = max_size;
    }
    // Also clamp current capture size into new range
    {
        let min_sz = *state.min_size.lock().map_err(|e| e.to_string())?;
        let max_sz = *state.max_size.lock().map_err(|e| e.to_string())?;
        let mut size_lock = state.capture_size.lock().map_err(|e| e.to_string())?;
        *size_lock = (*size_lock).clamp(min_sz, max_sz);
    }
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
            update_color_format,
            update_capture_limits,
        ])
		.setup(|app| {
			match setup_config() {
                Ok(()) => {
                    if let Ok(config) = get_config() {
                        if config.mode == "dev" {
                            if let Some(window) = app.get_webview_window("main") {
								window.open_devtools();
								println!("DevTools opened in development mode");
                            }
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Warning: Failed to setup config: {}", e);
                    eprintln!("Application will continue without DevTools");
                }
            }

            Ok(())
		})
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
