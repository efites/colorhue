import {app, BrowserWindow, desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
import {writeFileSync} from 'node:fs'
import path from 'node:path'

// ToDo - async функцию упростить
export const initPickColor = () => {
	ipcMain.handle('pick-color', async () => {
		return new Promise((resolve, reject) => {
			let pickerWindow: BrowserWindow | null = null

			const cleanup = () => {
				if (pickerWindow) {
					pickerWindow.close()
					pickerWindow = null
				}
			}

			try {
				const mainDisplay = screen.getPrimaryDisplay()
				const {width, height} = mainDisplay.workAreaSize

				pickerWindow = new BrowserWindow({
					width,
					height,
					transparent: true,
					frame: false,
					alwaysOnTop: true,
					webPreferences: {
						nodeIntegration: true,
						contextIsolation: false,
					},
				})

				// Load overlay
				pickerWindow
					.loadFile('src/renderer/overlays/picker.html')
					.then(() => {
						// Получаем скриншот экрана
						desktopCapturer
							.getSources({types: ['screen'], thumbnailSize: {width, height}})
							.then(sources => {
								const screenshot = sources[0].thumbnail
								const tempImagePath = path.join(
									app.getPath('temp'),
									'screenshot.png',
								)
								writeFileSync(tempImagePath, screenshot.toPNG())

								// Обработка клика
								pickerWindow.webContents.executeJavaScript(`
									document.body.addEventListener('click', (e) => {
									window.electronAPI.sendColor(e.screenX, e.screenY);
								});
							`)

								// Ждем цвет от оверлея
								ipcMain.once('send-color', (event, x, y) => {
									const img = nativeImage.createFromPath(tempImagePath)
									const pixelData = new Uint8Array(img.toBitmap())
									const offset = (y * width + x) * 4
									const hexColor = `#${[
										pixelData[offset].toString(16).padStart(2, '0'),
										pixelData[offset + 1].toString(16).padStart(2, '0'),
										pixelData[offset + 2].toString(16).padStart(2, '0'),
									].join('')}`

									cleanup()
									resolve(hexColor)
								})
							})
							.catch(err => {
								cleanup()
								reject(err)
							})
					})
					.catch(err => {
						cleanup()
						reject(err)
					})
			} catch (err) {
				cleanup()
				reject(err)
			}
		})
	})
}
