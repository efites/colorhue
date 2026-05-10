use tauri::{AppHandle, Emitter, Manager, State, WebviewUrl, WebviewWindowBuilder, Window};
use serde_json::json;
use once_cell::sync::OnceCell;
use base64::{engine::general_purpose::STANDARD, Engine as _};
use image::codecs::png::PngEncoder;
use image::{ExtendedColorType, ImageEncoder};
use screenshots::Screen;
use std::path::Path;
use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use tauri::async_runtime as tauri_rt;
use device_query::{DeviceQuery, DeviceState};
use std::fs;
use serde::{Deserialize, Serialize};
use specta_typescript::{Typescript};
use tauri_specta::*;

#[derive(Serialize, specta::Type)]
struct Luminance {
    tint: u32,
    shade: u32,
}

// #[derive(Serialize)]
#[derive(Serialize, specta::Type)]
struct CaptureData {
    base: String,
    displayed: String,
    format: String,
    alpha: u32,
    luminance: Luminance,
    image: String, // data:image/png;base64,<...>
}

struct CaptureStreamState {
    is_running: AtomicBool,
    handle: Mutex<Option<tauri_rt::JoinHandle<()>>>,
    last_image: Mutex<Option<String>>,
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

/// Устанавливает размеры главного окна.
/// @param width  Ширина в логических пикселях.
/// @param height Высота в логических пикселях.
/// @returns {void}
#[tauri::command]
#[specta::specta]
fn set_window_size(window: Window, width: f64, height: f64) -> Result<(), String> {
    window
        .set_size(tauri::Size::Logical(tauri::LogicalSize { width, height }))
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Возвращает приветствие для переданного имени.
/// @param name Имя пользователя.
/// @returns {string} Строка приветствия.
#[tauri::command]
#[specta::specta]
fn greet(
    name: &str,
) -> String {
    format!("Hello, {}! You've been here from Rust!", name)
}

/// Показывает главное окно приложения.
/// @returns {void}
#[tauri::command]
#[specta::specta]
fn show_window(window: Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    Ok(())
}

/// Завершает процесс приложения.
/// @returns {void} Функция не возвращает управление.
#[tauri::command]
#[specta::specta]
fn exit_app() {
    std::process::exit(0);
}

/// Сворачивает главное окно.
/// @returns {void}
#[tauri::command]
#[specta::specta]
fn minimize_window(app_handle: AppHandle) {
    let window = app_handle.get_webview_window("main").unwrap();
    window.minimize().unwrap();
}

/// Создаёт и показывает окно пипетки.
/// @param window_name Уникальное имя создаваемого окна.
/// @returns {void}
#[tauri::command]
#[specta::specta]
async fn create_overlay(app_handle: tauri::AppHandle, window_name: &str) -> Result<(), String> {
    let config = get_config()?;
    let build_mode = config.mode;
    let mut builder = WebviewWindowBuilder::new(
        &app_handle,
        window_name,
        WebviewUrl::App("./src/overlays/picker.html".into()),
    )
    .transparent(true)
    .decorations(false)
    .always_on_top(true)
    .focused(true)
    .visible(false);

    if build_mode == "dev" {
        let sizes = config.overlay.unwrap_or(Overlay {
            width: 150,
            height: 250,
        });
        builder = builder.inner_size(sizes.width as f64, sizes.height as f64);
    } else {
        builder = builder.fullscreen(true);
    }

    let overlay = builder.build().map_err(|e| e.to_string())?;
    overlay.set_ignore_cursor_events(false).map_err(|e| e.to_string())?;
    overlay.show().map_err(|e| e.to_string())?;
    Ok(())
}

/// Отправляет координаты курсора и размер области захвата в главное окно.
/// @param x    Координата X курсора.
/// @param y    Координата Y курсора.
/// @param size Размер области захвата (опционально).
/// @returns {void}
#[tauri::command]
#[specta::specta]
async fn send_cursor_position(
    app_handle: tauri::AppHandle,
    x: i32,
    y: i32,
    size: Option<u32>,
) -> Result<(), String> {
    app_handle
        .emit_to(
            "main",
            "send_cursor_position",
            Some(json!({"x": x, "y": y, "size": size})),
        )
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Закрывает оверлейное окно по его имени.
/// @param window_name Имя окна для закрытия.
/// @returns {void}
#[tauri::command]
#[specta::specta]
async fn close_overlay(app_handle: tauri::AppHandle, window_name: &str) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window(window_name) {
        window.close().map_err(|e| e.to_string())?;
    }
    Ok(())
}

/// Захватывает область экрана вокруг курсора и возвращает данные цвета.
/// @param x      Координата X центра области.
/// @param y      Координата Y центра области.
/// @param size   Размер области (опционально, по умолчанию 50).
/// @param format Формат цвета: "hex" или "rgb" (опционально).
/// @returns {CaptureData} Данные захвата или ошибка.
#[tauri::command]
#[specta::specta]
fn capture_cursor_area(
    x: i32,
    y: i32,
    size: Option<u32>,
    format: Option<String>,
) -> Result<CaptureData, String> {
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

    let fmt = format.unwrap_or_else(|| "hex".to_string());

    Ok(CaptureData {
        base: color_hex.clone(),
        displayed: color_hex,
        luminance: Luminance {
            tint: 0,
            shade: 0,
        },
        alpha: 100,
        format: String::from("hex"),
        image: data_url,
    })
}

/// Запускает фоновый поток непрерывного захвата цвета под курсором.
/// @param window_name Имя окна, куда отправлять события с кадрами.
/// @param fps         Частота кадров (5–60, по умолчанию 12).
/// @param size        Размер области захвата (опционально, ограничивается min/max).
/// @param format      Формат цвета "hex" или "rgb" (опционально).
/// @returns {void} Поток запущен или уже был активен.
#[tauri::command]
#[specta::specta]
fn start_capture_stream(
    app_handle: AppHandle,
    state: State<Arc<CaptureStreamState>>,
    window_name: &str,
    fps: Option<u32>,
    size: Option<u32>,
    format: Option<String>,
) -> Result<(), String> {
    if state.is_running.swap(true, Ordering::SeqCst) {
        return Ok(());
    }

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
                if let Ok(data) = capture_cursor_area(x as i32, y as i32, Some(size_cur), Some(fmt_cur)) {
                    let mut last = state_clone.last_image.lock().unwrap();
                    if last.as_ref().map(|s| s.as_str()) != Some(data.image.as_str()) {
                        *last = Some(data.image.clone());
                        let _ = app_handle_clone.emit_to(
                            &window_name_owned,
                            "picker_frame",
                            Some(json!({
                                "base": data.base,
                                "displayed": data.displayed,
                                "format": data.format,
                                "alpha": data.alpha,
                                "image": data.image,
                            })),
                        );
                    }
                }

                let process_ms = frame_start.elapsed().as_millis() as u64;
                frames_since_adjust += 1;
                if frames_since_adjust >= 5 {
                    frames_since_adjust = 0;
                    let mut fps_lock = state_clone.fps.lock().unwrap();
                    let mut fps_val = *fps_lock;
                    if process_ms > interval_ms {
                        if fps_val > MIN_FPS {
                            fps_val = fps_val.saturating_sub(2);
                        }
                    } else if process_ms * 2 + 2 < interval_ms {
                        if fps_val < MAX_FPS {
                            fps_val = fps_val.saturating_add(1);
                        }
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

/// Останавливает активный поток захвата цвета.
/// @returns {void}
#[tauri::command]
#[specta::specta]
fn stop_capture_stream(state: State<Arc<CaptureStreamState>>) -> Result<(), String> {
    state.is_running.store(false, Ordering::SeqCst);
    Ok(())
}

/// Изменяет размер области захвата во время работы потока.
/// @param size Новый размер (будет ограничен min..max).
/// @returns {void}
#[tauri::command]
#[specta::specta]
fn update_capture_size(state: State<Arc<CaptureStreamState>>, size: u32) -> Result<(), String> {
    let min_sz = *state.min_size.lock().map_err(|e| e.to_string())?;
    let max_sz = *state.max_size.lock().map_err(|e| e.to_string())?;
    let mut lock = state.capture_size.lock().map_err(|e| e.to_string())?;
    *lock = size.clamp(min_sz, max_sz);
    Ok(())
}

/// Изменяет формат представления цвета во время работы потока.
/// @param format Новый формат ("hex" или "rgb"). Если не указан, сбрасывается на "hex".
/// @returns {void}
#[tauri::command]
#[specta::specta]
fn update_color_format(
    state: State<Arc<CaptureStreamState>>,
    format: Option<String>,
) -> Result<(), String> {
    let mut lock = state.color_format.lock().map_err(|e| e.to_string())?;
    *lock = format.unwrap_or_else(|| "hex".to_string());
    Ok(())
}

/// Задаёт допустимые пределы размера области захвата.
/// @param min_size Минимально разрешённый размер.
/// @param max_size Максимально разрешённый размер.
/// @returns {void} Ошибка, если min_size > max_size или одно из значений равно 0.
#[tauri::command]
#[specta::specta]
fn update_capture_limits(
    state: State<Arc<CaptureStreamState>>,
    min_size: u32,
    max_size: u32,
) -> Result<(), String> {
    if min_size == 0 || max_size == 0 || min_size > max_size {
        return Err("invalid limits".to_string());
    }
    {
        let mut min_lock = state.min_size.lock().map_err(|e| e.to_string())?;
        *min_lock = min_size;
    }
    {
        let mut max_lock = state.max_size.lock().map_err(|e| e.to_string())?;
        *max_lock = max_size;
    }
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
    let specta_builder = Builder::<tauri::Wry>::new()
        .commands(tauri_specta::collect_commands![
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
        ]);

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
        .setup(move |app| {
            #[cfg(debug_assertions)]
            {
                specta_builder.export(Typescript::default(), "../src/bindings.ts")
                    .expect("Failed to export specta bindings");
            }

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
