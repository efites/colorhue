import {ipcRenderer} from 'electron'


if (!window.electronAPI) {
	// @ts-ignore
	window.electronAPI = {}
}
if (!window.electronAPI.captureArea) {
	window.electronAPI.captureArea = (x, y) => ipcRenderer.send('capture-area', x, y)
}

toggleFullScreen()

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

// Состояние смещения
let currentTranslateX = 0
let currentTranslateY = 0

// Размеры блока
const {width: pipetteWidth, height: pipetteHeight} = pipette.getBoundingClientRect()

let lastPosition = {clientX: 0, clientY: 0}
let animationFrameId: number | null = null

function updatePipettePosition(e: MouseEvent) {
	lastPosition = {clientX: e.clientX, clientY: e.clientY}

	if (!animationFrameId) {
		animationFrameId = requestAnimationFrame(processPipettePosition)
	}
}

function processPipettePosition() {
	const {clientX, clientY} = lastPosition
	const baseLeft = clientX + offsetX
	const baseTop = clientY + offsetY

	const rightDangerZone = window.innerWidth - pipetteWidth - safetyMargin
	const bottomDangerZone = window.innerHeight - pipetteHeight - safetyMargin

	let newTranslateX = 0
	let newTranslateY = 0

	if (clientX > rightDangerZone) {
		newTranslateX = -pipetteWidth - offsetX - safetyMargin
	}

	if (clientY > bottomDangerZone) {
		newTranslateY = -pipetteHeight - offsetY - safetyMargin
	}

	if (newTranslateX !== currentTranslateX || newTranslateY !== currentTranslateY) {
		currentTranslateX = newTranslateX
		currentTranslateY = newTranslateY
		pipette.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px)`
	}

	if (pipette.style.left !== `${baseLeft}px` || pipette.style.top !== `${baseTop}px`) {
		pipette.style.left = `${baseLeft}px`
		pipette.style.top = `${baseTop}px`
	}

	animationFrameId = null
}

function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen()
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen()
		}
	}
}
