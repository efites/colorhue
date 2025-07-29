import {desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
import path from 'node:path'

import {createPickerWindow} from '../windows'

export const initPickColor = () => {
	ipcMain.handle('open-picker', async () => {
		// eslint-disable-next-line no-async-promise-executor
		return new Promise<{color: string; image: string}>(async resolve => {
			const pickerWindow = createPickerWindow()

			pickerWindow.loadFile(path.resolve(__dirname, 'src/renderer/overlays/picker.html'))

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
						return (acc += value.toString(16).padStart(2, '0'))
					}, '#')

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
