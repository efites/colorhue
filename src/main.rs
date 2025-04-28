use slint::slint;

slint! {
    import { VerticalBox, Button } from "std-widgets.slint";

    export component App inherits Window {
        in property <color> bg_color: #f0f0f0;
        width: 300px;
        height: 200px;
        title: "Rust + Slint App";

        callback next_color();

        VerticalBox {
            alignment: center;
            Button {
                text: "Сменить цвет";
                clicked => {
                    root.next_color();
                }
            }
        }
        background: bg_color;
    }
}

fn main() {
    let app = App::new().unwrap();
    
    let app_weak = app.as_weak();
    app.on_next_color(move || {
        let app = app_weak.unwrap();
        let current = app.get_bg_color();
        let new_color = if current == slint::Color::from_rgb_u8(0xf0, 0xf0, 0xf0) {
            slint::Color::from_rgb_u8(0xff, 0x00, 0x00)  // Красный
        } else if current == slint::Color::from_rgb_u8(0xff, 0x00, 0x00) {
            slint::Color::from_rgb_u8(0x00, 0xff, 0x00)  // Зеленый
        } else if current == slint::Color::from_rgb_u8(0x00, 0xff, 0x00) {
            slint::Color::from_rgb_u8(0x00, 0x00, 0xff)  // Синий
        } else {
            slint::Color::from_rgb_u8(0xf0, 0xf0, 0xf0)  // Серый
        };
        app.set_bg_color(new_color);
    });
    
    app.run().unwrap();
}