import type {BrowserWindow} from 'electron'

import {desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
import {writeFileSync} from 'node:fs'
import path from 'node:path'

import {createPickerWindow} from '../windows'

const loadPickerOverlay = async (window: BrowserWindow) => {
	await window.loadFile('src/renderer/overlays/picker.html')
	await window.webContents.executeJavaScript(`
		document.body.addEventListener('click', (e) => {
			window.electronAPI.sendColor(e.screenX, e.screenY);
		});
	`)
}

const captureScreen = async (width: number, height: number) => {
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

export const initPickColor = () => {
	ipcMain.handle('pick-color', async () => {
		let pickerWindow: BrowserWindow | null = null

		try {
			// Pipette
			const {width, height} = screen.getPrimaryDisplay().workAreaSize
			pickerWindow = createPickerWindow(width, height)

			// Overlay
			await loadPickerOverlay(pickerWindow)

			// 3. Screenshot
			const {screenshot, tempImagePath} = await captureScreen(width, height)

			// 4. Whait for the color that has been picked
			return await waitForColorSelection(screenshot, tempImagePath, width)
		} catch (error) {
			console.log(error)
			throw error
		} finally {
			pickerWindow?.close()
		}
	})
}
