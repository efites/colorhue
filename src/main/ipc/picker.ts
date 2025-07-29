import {desktopCapturer, ipcMain, nativeImage, screen} from 'electron'
import path from 'node:path'

import {createPickerWindow} from '../windows'

interface IResponse {
	color: string | undefined
	image: string | undefined
}

export const initPickColor = () => {
	ipcMain.handle('getAreaPreview', (_, x: number, y: number) => getAreaPreview(x, y))

	ipcMain.handle('open-picker', () => {
		return new Promise<IResponse>((resolve) => {
			const pickerWindow = createPickerWindow()

			pickerWindow.loadFile(path.resolve(__dirname, 'src/renderer/overlays/picker.html')).then(() => {
				ipcMain.once('send-color', async (_, x: number, y: number) => {
					try {
						const [preview, color] = await Promise.all([
							getAreaPreview(x, y),
							getColorAtPoint(x, y)
						])

						resolve({image: preview, color})
					} finally {
						pickerWindow.close()
					}
				})
			})
		})
	})
}

async function getAreaPreview(x: number, y: number) {
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
	const size = 80
	const halfSize = Math.floor(size / 2)

	const cropped = img.crop({
		x: Math.max(0, relX - halfSize),
		y: Math.max(0, relY - halfSize),
		width: Math.min(size, display.size.width - relX + halfSize),
		height: Math.min(size, display.size.height - relY + halfSize)
	})

	return cropped.toDataURL()
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
