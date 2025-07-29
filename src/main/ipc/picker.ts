import {desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
import path from 'node:path'

import {createPickerWindow} from '../windows'


export const initPickColor = () => {
	ipcMain.handle('get-color', async (_, x: number, y: number) => await getColorAtPoint(x, y))

	ipcMain.handle('get-screenshot', async (_, x: number, y: number, size = 80) => await getScreenshotAtPoint(x, y, size))

	ipcMain.handle('get-picker-data', async (_, x: number, y: number) => {
		const [color, image] = await Promise.all([
			getColorAtPoint(x, y),
			getScreenshotAtPoint(x, y),
		])

		return {color, image}
	})

	ipcMain.handle('open-picker', () => {
		return new Promise(resolve => {
			const pickerWindow = createPickerWindow()

			pickerWindow.loadFile(path.resolve(__dirname, 'src/renderer/overlays/picker.html')).then(() => {
				ipcMain.once('close-picker', async (_, data) => {
					pickerWindow.close()
					resolve(data)
				})
			})
		})
	})
}

async function getColorAtPoint(x: number, y: number): Promise<string> {
	const display = screen.getDisplayNearestPoint({x, y})
	const relX = x - display.bounds.x
	const relY = y - display.bounds.y

	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: display.size,
	})

	const source = sources.find(s => s.display_id === `${display.id}`)
	if (!source) return '#000000'

	const img = nativeImage.createFromBuffer(source.thumbnail.toPNG())
	const bitmap = img.toBitmap()
	const pos = (Math.round(relY) * display.size.width + Math.round(relX)) * 4

	// BGRA to HEX
	const [b, g, r] = [bitmap[pos], bitmap[pos + 1], bitmap[pos + 2]]
	return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}

async function getScreenshotAtPoint(x: number, y: number, size = 80): Promise<string> {
	const display = screen.getDisplayNearestPoint({x, y})
	const relX = x - display.bounds.x
	const relY = y - display.bounds.y

	const sources = await desktopCapturer.getSources({
		types: ['screen'],
		thumbnailSize: display.size,
	})

	const source = sources.find(s => s.display_id === `${display.id}`)
	if (!source) return ''

	const img = nativeImage.createFromBuffer(source.thumbnail.toPNG())
	const halfSize = Math.floor(size / 2)

	const cropped = img.crop({
		x: Math.max(0, relX - halfSize),
		y: Math.max(0, relY - halfSize),
		width: Math.min(size, display.size.width - relX + halfSize),
		height: Math.min(size, display.size.height - relY + halfSize),
	})

	return cropped.toDataURL()
}

