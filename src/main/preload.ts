import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	openPicker: () => ipcRenderer.invoke('open-picker'),
	captureArea: (x: number, y: number) => ipcRenderer.invoke('capture-area', x, y),
	pickColor: () => ipcRenderer.invoke('pick-color'),
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	closeWindow: () => ipcRenderer.send('close-window'),
	sendColor: (x: number, y: number) => ipcRenderer.send('send-color', x, y),
	resizeWindow: (width: number, height: number) =>
		ipcRenderer.send('resize-window', width, height),
})
