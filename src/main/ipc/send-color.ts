import {ipcMain, nativeImage} from 'electron'

export const initSendColor = (resolve: (value: unknown) => void, path: string) => {
	ipcMain.once('send-color', (_, x: number, y: number) => {
		const img = nativeImage.createFromPath(path)
		const pixelData = new Uint8Array(img.toBitmap())
		const offset = (y * screenWidth + x) * 4

		resolve(
			`#${[
				pixelData[offset].toString(16).padStart(2, '0'),
				pixelData[offset + 1].toString(16).padStart(2, '0'),
				pixelData[offset + 2].toString(16).padStart(2, '0'),
			].join('')}`,
		)
	})
}
