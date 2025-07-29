import {desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
import path from 'node:path'

import {createPickerWindow} from '../windows'

interface IResponse {
	color: string | undefined
	image: string | undefined
}

export const initPickColor = () => {
	ipcMain.handle('open-picker', () => {
		return new Promise<IResponse>((resolve) => {
			const pickerWindow = createPickerWindow()
			const overlayPath = path.resolve(__dirname, 'src/renderer/overlays/picker.html')

			pickerWindow.loadFile(overlayPath).then(() => {
				ipcMain.once('capture-area', async (_, x: number, y: number) => {
					try {
						const display = screen.getDisplayNearestPoint({x, y})
						const relX = x - display.bounds.x
						const relY = y - display.bounds.y

						// Get 1x1 pixel
						const sources = await desktopCapturer.getSources({
							types: ['screen'],
							thumbnailSize: display.size,
						})

						const source = sources.find(s => s.display_id === `${display.id}`)
						if (!source) throw new Error('Display not found')

						const img = nativeImage.createFromBuffer(source.thumbnail.toPNG())
						const bitmap = img.toBitmap()

						// Pixel to bitmap
						const pos = (Math.round(relY) * display.size.width + Math.round(relX)) * 4

						// BGRA code color
						const [b, g, r] = [bitmap[pos], bitmap[pos + 1], bitmap[pos + 2]]

						// RGB code color
						const hexColor = [r, g, b].reduce((acc, value) => {
							return (acc += value.toString(16).padStart(2, '0'))
						}, '#')

						// Screenshot around cursor (px)
						const size = 80
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
						resolve({image: undefined, color: undefined})
					} finally {
						pickerWindow?.close()
					}
				})
			})
		})
	})
}
