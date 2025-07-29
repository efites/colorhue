import {ipcRenderer} from 'electron'
//const {ipcRenderer} = require('electron')

// @ts-ignore
if (!window.electronAPI) window.electronAPI = {}
if (!window.electronAPI.captureArea)
	window.electronAPI.captureArea = (x, y) => ipcRenderer.send('capture-area', x, y)

document.addEventListener('click', async event => {
	try {
		const {screenX: x, screenY: y} = event

		await ipcRenderer.send('capture-area', x, y)
	} catch (error) {
		console.error('Error:', error)
	}
})

document.addEventListener('mousemove', updatePipettePosition)

const pipette = document.getElementById('pipette')
const offsetX = 15
const offsetY = 15
const safetyMargin = 20

pipette.style.transition = 'transform 0.3s ease'

// Для демонстрации опасных зон (можно удалить)
const rightZone = document.getElementById('right-zone')
const bottomZone = document.getElementById('bottom-zone')

// Состояние смещения
let currentTranslateX = 0
let currentTranslateY = 0

// Размеры блока
const {width: pipetteWidth, height: pipetteHeight} = pipette.getBoundingClientRect()

function updatePipettePosition(e: MouseEvent) {
	const baseLeft = e.clientX + offsetX
	const baseTop = e.clientY + offsetY

	const rightDangerZone = window.innerWidth - pipetteWidth - safetyMargin
	const bottomDangerZone = window.innerHeight - pipetteHeight - safetyMargin

	// Can delete
	rightZone.style.display = 'block'
	rightZone.style.left = `${rightDangerZone}px`
	rightZone.style.top = '0'
	rightZone.style.width = `${window.innerWidth - rightDangerZone}px`
	rightZone.style.height = `${window.innerHeight}px`

	bottomZone.style.display = 'block'
	bottomZone.style.left = '0'
	bottomZone.style.top = `${bottomDangerZone}px`
	bottomZone.style.width = `${window.innerWidth}px`
	bottomZone.style.height = `${window.innerHeight - bottomDangerZone}px`

	if (e.clientX > rightDangerZone) {
		currentTranslateX = -pipetteWidth - offsetX - safetyMargin
	} else {
		currentTranslateX = 0
	}

	if (e.clientY > bottomDangerZone) {
		currentTranslateY = -pipetteHeight - offsetY - safetyMargin
	} else {
		currentTranslateY = 0
	}

	pipette.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px)`

	pipette.style.left = `${baseLeft}px`
	pipette.style.top = `${baseTop}px`
}
