import {app, BrowserWindow} from 'electron'
import process from 'node:process'

import {createMainWindow} from './index'

let mainWindow: BrowserWindow | null = null

export const initWindows = () => {
	app.on('ready', () => {
		mainWindow = createMainWindow()
	})

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit()
		}
	})

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			mainWindow = createMainWindow()
		}
	})
}

export const getMainWindow = () => {
	return mainWindow
}
