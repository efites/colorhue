import {invoke} from '@tauri-apps/api/core'
import {listen, UnlistenFn} from '@tauri-apps/api/event'
import {PipetteCapture} from '../types/picker'
// types are handled implicitly via event payload

const offsetX = 15
const offsetY = 15
const safetyMargin = 20
let currentTranslateX = 0
let currentTranslateY = 0
let positionRafId: number | null = null
let streamUnlisten: UnlistenFn | null = null
let lastImageDataUrl: string | null = null
const MIN_SIZE = 5
const MAX_SIZE = 50
let currentSize = 50

const pipette = document.getElementById('pipette') as HTMLDivElement
const cube = document.getElementById('cube') as HTMLDivElement
const image = document.getElementById('image') as HTMLImageElement

const {width: pipetteWidth, height: pipetteHeight} = pipette.getBoundingClientRect()


function init() {
	document.addEventListener('click', clickPipetteHandler)
	document.addEventListener('mousemove', mouseMoveHandler)
    document.addEventListener('wheel', wheelHandler, { passive: true })
	window.addEventListener('beforeunload', () => {
		if (positionRafId) cancelAnimationFrame(positionRafId)
		stopStream()
	})

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
	await invoke('start_capture_stream', { windowName: 'picker', fps: 12, size: 50 })

	streamUnlisten = await listen<PipetteCapture>('picker_frame', (event) => {
		const {image: nextImage, color: nextColor} = event.payload

		if (lastImageDataUrl === nextImage) return

		lastImageDataUrl = nextImage
		image.src = nextImage
		cube.style.background = nextColor
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
    const step = 5
    let next = currentSize + (delta > 0 ? -step : step)

    next = Math.min(MAX_SIZE, Math.max(MIN_SIZE, next))

    if (next === currentSize) return
    currentSize = next

    await invoke('update_capture_size', { size: currentSize })
}

async function clickPipetteHandler(event: MouseEvent) {
	try {
		const {screenX: x, screenY: y} = event

        await invoke('send_cursor_position', {
            x: Math.round(x),
            y: Math.round(y),
            size: currentSize
        })

		if (positionRafId) cancelAnimationFrame(positionRafId)
		await stopStream()
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

init()
