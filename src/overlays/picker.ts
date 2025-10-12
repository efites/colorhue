import {invoke} from '@tauri-apps/api/core'
import {APP_CONFIG} from '../shared/config/pipette'
import {listen, UnlistenFn} from '@tauri-apps/api/event'
// types are inferred from event payload
// types are handled implicitly via event payload

const offsetX = 15
const offsetY = 15
const safetyMargin = 20
let currentTranslateX = 0
let currentTranslateY = 0
let positionRafId: number | null = null
let streamUnlisten: UnlistenFn | null = null
let lastImageDataUrl: string | null = null
const MIN_SIZE = APP_CONFIG.pipette.min
const MAX_SIZE = APP_CONFIG.pipette.max
let currentSize = Math.min(Math.max(APP_CONFIG.pipette.default, MIN_SIZE), MAX_SIZE)

const pipette = document.getElementById('pipette') as HTMLDivElement
const cube = document.getElementById('cube') as HTMLDivElement
const image = document.getElementById('image') as HTMLImageElement
const colorText = document.querySelector('.code') as HTMLHeadingElement

const {width: pipetteWidth, height: pipetteHeight} = pipette.getBoundingClientRect()

function init() {
	document.addEventListener('click', clickPipetteHandler)
	document.addEventListener('mousemove', mouseMoveHandler)
	document.addEventListener('wheel', wheelHandler, {passive: true})
	window.addEventListener('beforeunload', () => {
		if (positionRafId) cancelAnimationFrame(positionRafId)
		stopStream()
	})

	// Позиционируем блок сразу при инициализации
	positionPipetteAtCursor()
	startStream()
}

function mouseMoveHandler(event: MouseEvent) {
	if (positionRafId) return
	positionRafId = requestAnimationFrame(() => {
		processPipettePosition(event)
		positionRafId = null
	})
}

async function startStream() {
	// send dynamic limits from env/config
	await invoke('update_capture_limits', {minSize: MIN_SIZE, maxSize: MAX_SIZE})
	await invoke('start_capture_stream', {
		windowName: 'picker',
		fps: 12,
		size: currentSize,
		format: 'hex',
	})

	streamUnlisten = await listen<any>('picker_frame', event => {
		const {image: nextImage, color: nextColor, x, y} = event.payload as any

		if (lastImageDataUrl === nextImage) return

		lastImageDataUrl = nextImage
		image.src = nextImage
		cube.style.background = nextColor

		// Обновляем текст цвета
		if (colorText) {
			colorText.textContent = nextColor
		}

		// Position pipette right away on the first frame based on cursor screen coords
		if (typeof x === 'number' && typeof y === 'number') {
			// Create a synthetic MouseEvent-like object for position function
			processPipettePosition({clientX: x, clientY: y} as MouseEvent)
		}
	})
}

async function stopStream() {
	if (streamUnlisten) {
		streamUnlisten()
		streamUnlisten = null
	}
	await invoke('stop_capture_stream')
}

async function wheelHandler(event: WheelEvent) {
	const delta = Math.sign(event.deltaY)
	const step = APP_CONFIG.pipette.step
	let next = currentSize + (delta > 0 ? step : -step)

	next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, next))

	if (next === currentSize) return
	currentSize = next

	await invoke('update_capture_size', {size: currentSize})
}

async function clickPipetteHandler(event: MouseEvent) {
	try {
		const {screenX: x, screenY: y} = event

		await invoke('send_cursor_position', {
			x: Math.round(x),
			y: Math.round(y),
			size: currentSize,
		})

		if (positionRafId) cancelAnimationFrame(positionRafId)
		await stopStream()
		await invoke('close_overlay', {windowName: 'picker'})
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

function positionPipetteAtCursor() {
	// Получаем текущую позицию курсора
	const mouseX = window.screenX + window.innerWidth / 2
	const mouseY = window.screenY + window.innerHeight / 2

	// Позиционируем блок сразу
	const baseLeft = mouseX + offsetX
	const baseTop = mouseY + offsetY

	pipette.style.left = `${baseLeft}px`
	pipette.style.top = `${baseTop}px`
}

init()
