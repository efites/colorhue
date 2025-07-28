import {BrowserWindow,desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
import {writeFileSync} from 'node:fs'
import path from 'node:path'

import {createPickerWindow} from '../windows'

/* const loadPickerOverlay = async (window: BrowserWindow) => {
	await window.loadFile('src/renderer/overlays/picker.html')
	await window.webContents.executeJavaScript(`
		document.body.addEventListener('click', (e) => {
			window.electronAPI.sendColor(e.screenX, e.screenY);
		});
	`)
} */

/* const captureScreen = async (width: number, height: number) => {
	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: {width, height},
	})

	const screenshot = sources[0].thumbnail
	const imageData = screenshot.toDataURL() // Конвертируем в base64
	const tempImagePath = path.join(__dirname, 'screenshot.png')
	writeFileSync(tempImagePath, screenshot.toPNG())

	return {screenshot, tempImagePath, imageData}
}

const waitForColorSelection = async (
	screenshot: Electron.NativeImage,
	tempImagePath: string,
	screenWidth: number,
) => {
	return new Promise(resolve => {
		ipcMain.once('send-color', (_, x: number, y: number) => {
			const img = nativeImage.createFromPath(tempImagePath)
			const pixelData = new Uint8Array(img.toBitmap())
			const offset = (y * screenWidth + x) * 4

			const color = `#${[
				pixelData[offset].toString(16).padStart(2, '0'),
				pixelData[offset + 1].toString(16).padStart(2, '0'),
				pixelData[offset + 2].toString(16).padStart(2, '0'),
			].join('')}`

			resolve({color, image: screenshot.toDataURL()})
		})
	})
}
 */
const captureAreaAroundClick = async (x: number, y: number, size = 50) => {
	const display = screen.getDisplayNearestPoint({x, y})
	const displayX = x - display.bounds.x
	const displayY = y - display.bounds.y

	const halfSize = Math.floor(size / 2)
	const captureWidth = Math.min(size, display.size.width - displayX)
	const captureHeight = Math.min(size, display.size.height - displayY)

	const captureWindow = new BrowserWindow({
		x: display.bounds.x + Math.max(0, displayX - halfSize),
		y: display.bounds.y + Math.max(0, displayY - halfSize),
		width: captureWidth,
		height: captureHeight,
		show: false,
		frame: false,
		skipTaskbar: true
	})

	try {
		await captureWindow.loadURL('about:blank')
		const img = await captureWindow.capturePage({
			x: Math.max(0, displayX - halfSize),
			y: Math.max(0, displayY - halfSize),
			width: captureWidth,
			height: captureHeight
		})

		writeFileSync(path.join(__dirname, 'screenshot.png'), img.toPNG())

		return img.toDataURL()
	} finally {
		captureWindow.destroy()
	}
}

const getColorAtPoint = async (x: number, y: number): Promise<string> => {
	const display = screen.getDisplayNearestPoint({ x, y });

    // Получаем точные координаты относительно дисплея
    const displayX = x - display.bounds.x;
    const displayY = y - display.bounds.y;

    // Создаем временное окно для захвата
    const captureWindow = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: 1,
        height: 1,
        show: false,
        frame: false,
        transparent: true,
        skipTaskbar: true
    });

    try {
        await captureWindow.loadURL('about:blank');

        // Захватываем 1x1 пиксель вокруг целевой точки
        const img = await captureWindow.capturePage({
            x: displayX,
            y: displayY,
            width: 1,
            height: 1
        });

        const bitmap = img.toBitmap();

        // Формат данных: [B, G, R, A] для каждого пикселя
        const blue = bitmap[0];
        const green = bitmap[1];
        const red = bitmap[2];

        return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
    } finally {
        captureWindow.destroy();
    }
}

export const initPickColor = () => {
	ipcMain.handle('pick-color', async () => {
		return new Promise(resolve => {
			const pickerWindow = createPickerWindow()

			pickerWindow.loadFile('src/renderer/overlays/picker.html')
			pickerWindow.webContents.executeJavaScript(`
				document.body.addEventListener('click', (e) => {
					window.electronAPI.sendColor(e.screenX, e.screenY);
				});
			`)

			ipcMain.once('send-color', async (_, x: number, y: number) => {
				try {
					// Получаем скриншот области вокруг клика
					const area = await captureAreaAroundClick(x, y)
					resolve({color: await getColorAtPoint(x, y), screenshot: area})
				} finally {
					pickerWindow.close()
				}
			})
		})
	})
}
