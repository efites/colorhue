import type {BrowserWindow} from 'electron'

import {desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
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
	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: display.size,
	})

	const screenshot = sources[0].thumbnail
	const img = nativeImage.createFromBuffer(screenshot.toPNG())

	// Вычисляем безопасные границы
	const halfSize = size / 2
	const left = Math.max(0, x - halfSize)
	const top = Math.max(0, y - halfSize)
	const right = Math.min(display.size.width, x + halfSize)
	const bottom = Math.min(display.size.height, y + halfSize)

	return img
		.crop({
			x: left,
			y: top,
			width: right - left,
			height: bottom - top,
		})
		.toDataURL()
}

const getColorAtPoint = async (x: number, y: number) => {
	const display = screen.getDisplayNearestPoint({x, y})
	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: display.size,
	})

	const img = nativeImage.createFromBuffer(sources[0].thumbnail.toPNG())
	const pixelData = new Uint8Array(img.toBitmap())
	const offset = (y * display.size.width + x) * 4

	return `#${[
		pixelData[offset].toString(16).padStart(2, '0'),
		pixelData[offset + 1].toString(16).padStart(2, '0'),
		pixelData[offset + 2].toString(16).padStart(2, '0'),
	].join('')}`
}

export const initPickColor = () => {
	ipcMain.handle('pick-color', async () => {
		return new Promise(resolve => {
			const pickerWindow = createPickerWindow()

			ipcMain.once('send-color', async (_, x: number, y: number) => {
				console.log('SEND_CO')
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
