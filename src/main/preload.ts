import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	// panel.ts
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	resizeWindow: (width: number, height: number) =>
		ipcRenderer.send('resize-window', width, height),
	closeWindow: () => ipcRenderer.send('close-window'),

	// picker.ts
	getColor: (x: number, y: number) => ipcRenderer.send('get-color', x, y),
	getScreenshot: (x: number, y: number, size?: number) =>
		ipcRenderer.invoke('get-screenshot', x, y, size),
	getPickerData: (x: number, y: number) => ipcRenderer.invoke('get-picker-data', x, y),
	openPicker: () => ipcRenderer.invoke('open-picker'),
	closePicker: (data: any) => ipcRenderer.send('close-picker', data),
})
