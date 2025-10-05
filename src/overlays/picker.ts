import {ipcRenderer} from 'electron'

const pipette = document.getElementById('pipette')
const cube = document.getElementById('cube')
const image = document.getElementById('image') as HTMLImageElement

const offsetX = 15
const offsetY = 15
const safetyMargin = 20
const DEBOUNCED_VALUE = 200
let currentTranslateX = 0
let currentTranslateY = 0

// Размеры блока
const {width: pipetteWidth, height: pipetteHeight} = pipette.getBoundingClientRect()

let lastPosition = {clientX: 0, clientY: 0}
let animationFrameId: number | null = null
const debouncedCubeColor = debounce(updateCubeColor, DEBOUNCED_VALUE)

function init() {
	toggleFullScreen()
	setElectronAPI()
	pipette.style.transition = 'transform 0.1s ease'

	document.addEventListener('click', clickPipetteHandler)
	document.addEventListener('mousemove', mouseMoveHandler)
}

async function updateCubeColor(event: MouseEvent) {
	const {screenX: x, screenY: y} = event

	const {color, image: picture} = await window.electronAPI.getPickerData(x, y)

	image.src = picture
	cube.style.background = color
}

function mouseMoveHandler(event: MouseEvent) {
	lastPosition = {clientX: event.clientX, clientY: event.clientY}

	if (!animationFrameId) {
		animationFrameId = requestAnimationFrame(() => {
			debouncedCubeColor(event)
			processPipettePosition()
			animationFrameId = null
		})
	}
}

function debounce<T extends (...args: Parameters<T>) => void>(
	this: ThisParameterType<T>,
	fn: T,
	delay = 300,
) {
	let timer: ReturnType<typeof setTimeout> | undefined
	return (...args: Parameters<T>) => {
		clearTimeout(timer)
		timer = setTimeout(() => fn.apply(this, args), delay)
	}
}

async function clickPipetteHandler(event: MouseEvent) {
	try {
		const {screenX: x, screenY: y} = event

		const data = await window.electronAPI.getPickerData(x, y)
		window.electronAPI.closePicker(data)
	} catch (error) {
		console.error('Error:', error)
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

function setElectronAPI() {
	window.electronAPI = {
		minimizeWindow: () => ipcRenderer.send('minimize-window'),
		resizeWindow: (width: number, height: number) =>
			ipcRenderer.send('resize-window', width, height),
		closeWindow: () => ipcRenderer.send('close-window'),
		getColor: (x: number, y: number) => ipcRenderer.invoke('get-color', x, y),
		getScreenshot: (x: number, y: number, size?: number) =>
			ipcRenderer.invoke('get-screenshot', x, y, size),
		getPickerData: (x: number, y: number) => ipcRenderer.invoke('get-picker-data', x, y),
		openPicker: () => ipcRenderer.invoke('open-picker'),
		closePicker: data => ipcRenderer.send('close-picker', data),
	}
}

init()
