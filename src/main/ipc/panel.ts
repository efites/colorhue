import {ipcMain} from 'electron'

import {getMainWindow} from '../windows'

export const initPanelHandlers = () => {
	ipcMain.on('minimize-window', () => {
		const window = getMainWindow()

		if (window) {
			window.minimize()
		}
	})

	ipcMain.on('resize-window', (event, width, height) => {
		const window = getMainWindow()

		if (window) {
			window.setSize(width, height)
		}
	})

	ipcMain.on('close-window', () => {
		const window = getMainWindow()

		if (window) {
			window.close()
		}
	})
}
