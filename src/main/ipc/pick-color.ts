import {desktopCapturer, ipcMain, nativeImage, screen} from 'electron'

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
/* const captureAreaAroundClick = async (x: number, y: number, size = 50) => {
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
		skipTaskbar: true,
	})

	try {
		await captureWindow.loadURL('about:blank')
		const img = await captureWindow.capturePage({
			x: Math.max(0, displayX - halfSize),
			y: Math.max(0, displayY - halfSize),
			width: captureWidth,
			height: captureHeight,
		})

		writeFileSync(path.join(__dirname, 'screenshot.png'), img.toPNG())

		return img.toDataURL()
	} finally {
		captureWindow.destroy()
	}
}

const getColorAtPoint = async (x: number, y: number): Promise<string> => {
	const display = screen.getDisplayNearestPoint({x, y})

	// Получаем точные координаты относительно дисплея
	const displayX = x - display.bounds.x
	const displayY = y - display.bounds.y

	// Создаем временное окно для захвата
	const captureWindow = new BrowserWindow({
		x: display.bounds.x,
		y: display.bounds.y,
		width: 1,
		height: 1,
		show: false,
		frame: false,
		transparent: true,
		skipTaskbar: true,
	})

	try {
		await captureWindow.loadURL('about:blank')

		// Захватываем 1x1 пиксель вокруг целевой точки
		const img = await captureWindow.capturePage({
			x: displayX,
			y: displayY,
			width: 1,
			height: 1,
		})

		const bitmap = img.toBitmap()

		// Формат данных: [B, G, R, A] для каждого пикселя
		const blue = bitmap[0]
		const green = bitmap[1]
		const red = bitmap[2]

		return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`
	} finally {
		captureWindow.destroy()
	}
} */

/* async function captureArea(x: number, y: number): Promise<string> {
	const display = screen.getDisplayNearestPoint({x, y})
	const {bounds} = display

	// Вычисляем координаты относительно дисплея
	const displayX = x - bounds.x
	const displayY = y - bounds.y

	// Размер области захвата
	const size = 50
	const halfSize = Math.floor(size / 2)

	// Вычисляем безопасные границы
	const captureX = Math.max(0, displayX - halfSize)
	const captureY = Math.max(0, displayY - halfSize)
	const captureWidth = Math.min(size, bounds.width - captureX)
	const captureHeight = Math.min(size, bounds.height - captureY)

	// Получаем источники захвата
	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: display.size,
	})

	// Находим нужный дисплей
	const source = sources.find(s => s.display_id === `${display.id}`)
	if (!source) throw new Error('Display not found')

	// Создаем изображение и обрезаем нужную область
	const img = nativeImage.createFromBuffer(source.thumbnail.toPNG())

	writeFileSync(path.join(__dirname, 'screenshot.png'), img.toPNG())

	return img
		.crop({
			x: captureX,
			y: captureY,
			width: captureWidth,
			height: captureHeight,
		})
		.toDataURL()
} */

export const initPickColor = () => {
	ipcMain.handle('open-picker', async () => {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise<{color: string, image: string}>(async resolve => {
			const pickerWindow = createPickerWindow()

			pickerWindow.loadFile('D:/Web/colorhue/src/renderer/overlays/picker.html')

			ipcMain.once('capture-area', async (_, x: number, y: number) => {
				try {
					const display = screen.getDisplayNearestPoint({x, y})
					const relX = x - display.bounds.x
					const relY = y - display.bounds.y

					// Захватываем 1x1 пиксель для определения цвета
					const sources = await desktopCapturer.getSources({
						types: ['screen'],
						thumbnailSize: display.size,
					})

					const source = sources.find(s => s.display_id === `${display.id}`)
					if (!source) throw new Error('Display not found')

					const img = nativeImage.createFromBuffer(source.thumbnail.toPNG())
					const bitmap = img.toBitmap()

					// Формула для расчета позиции пикселя в bitmap
					const pos = (Math.round(relY) * display.size.width + Math.round(relX)) * 4

					// Получаем цвет (формат BGRA)
					const [b, g, r] = [bitmap[pos], bitmap[pos + 1], bitmap[pos + 2]]

					//const hexColor = '#123456'
					const hexColor = [r, g, b].reduce((acc, value) => {
						return acc += value.toString(16).padStart(2, '0')
					}, '#')
					/* const hexColor = `#${[r, g, b].map(c =>
						c.toString(16).padStart(2, '0')
        			}.join('')` */

					// Захватываем область 50x50 (как раньше)
					const size = 50
					const halfSize = Math.floor(size / 2)
					const captureX = Math.max(0, relX - halfSize)
					const captureY = Math.max(0, relY - halfSize)
					const captureWidth = Math.min(size, display.bounds.width - captureX)
					const captureHeight = Math.min(size, display.bounds.height - captureY)

					const cropped = img.crop({
						x: captureX,
						y: captureY,
						width: captureWidth,
						height: captureHeight,
					})

					resolve({
						image: cropped.toDataURL(),
						color: hexColor,
					})
				} catch (error) {
					console.error('Error:', error)
					resolve({image: '', color: '#000000'})
				} finally {
					pickerWindow?.close()
				}
			})
		})
	})
}
