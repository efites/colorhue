use eframe::egui;

fn main() -> Result<(), eframe::Error> {
    let options = eframe::NativeOptions {
        viewport: egui::ViewportBuilder::default()
            .with_inner_size([400.0, 560.0])  // Размер окна
            .with_decorations(true)            // Окно с рамкой
            .with_transparent(true),           // Прозрачность для закругления углов
        ..Default::default()
    };

    eframe::run_native(
        "Моё Rust-приложение",
        options,
        Box::new(|_cc| Ok(Box::<MyApp>::default())), // Обратите внимание на Ok()!
    )
}

#[derive(Default)]
struct MyApp;

impl eframe::App for MyApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        // Закругление углов окна
        ctx.style_mut(|style| {
            //style.visuals.window_rounding = 10.0.into();  // Радиус 10px
            style.visuals.window_corner_radius = 10.0.into();  // Радиус 10px
        });

        // Центральная панель с текстом
        egui::CentralPanel::default().show(ctx, |ui| {
            ui.heading("Привет, Rust + egui!");
        });
    }
}