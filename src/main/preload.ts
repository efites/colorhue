import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	// panel.ts
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	resizeWindow: (width: number, height: number) =>
		ipcRenderer.send('resize-window', width, height),
	closeWindow: () => ipcRenderer.send('close-window'),

	// picker.ts
	openPicker: () => ipcRenderer.invoke('open-picker'),
	captureArea: (x: number, y: number) => ipcRenderer.invoke('capture-area', x, y),
	pickColor: () => ipcRenderer.invoke('pick-color'),
	sendColor: (x: number, y: number) => ipcRenderer.send('send-color', x, y),
})
