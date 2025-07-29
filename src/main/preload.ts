import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	// panel.ts
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	resizeWindow: (width: number, height: number) =>
		ipcRenderer.send('resize-window', width, height),
	closeWindow: () => ipcRenderer.send('close-window'),

	// picker.ts
	sendColor: (x: number, y: number) => ipcRenderer.send('send-color', x, y),
	getAreaPreview: (x: number, y: number) => ipcRenderer.invoke('getAreaPreview', x, y),
	openPicker: () => ipcRenderer.invoke('open-picker'),
	//captureArea: (x: number, y: number) => ipcRenderer.invoke('capture-area', x, y),
})
