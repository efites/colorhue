import {app} from '@tauri-apps/api'
import {invoke} from '@tauri-apps/api/core'
import {IPippete} from '../components/Main/Main'

const pipette = document.getElementById('pipette')
const cube = document.getElementById('cube') as HTMLDivElement
const image = document.getElementById('image') as HTMLImageElement

const offsetX = 15
const offsetY = 15
const safetyMargin = 20
const DEBOUNCED_VALUE = 0
let currentTranslateX = 0
let currentTranslateY = 0

// Размеры блока
const {width: pipetteWidth, height: pipetteHeight} = pipette.getBoundingClientRect()

let animationFrameId: number | null = null

function init() {
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
	if (animationFrameId) return

	animationFrameId = requestAnimationFrame(async () => {
		processPipettePosition(event)
		await processPipetteContent(event)

		animationFrameId = null
	})
}

async function processPipetteContent({clientX: x, clientY: y}: MouseEvent) {
	const result = await invoke<IPippete>('capture_cursor_area', {x, y})

	image.src = result.image
	cube.style.background = result.color
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

		await invoke('send_cursor_position', {
			x: Math.round(x),
			y: Math.round(y)
		})

		await invoke("close_overlay", {windowName: 'picker'})
	} catch (error) {
		console.error('Error:', error)
	}
}

function processPipettePosition(event: MouseEvent) {
	const {clientX, clientY} = event

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
