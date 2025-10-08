import {invoke} from '@tauri-apps/api/core'
import {PipetteCapture} from '../types/picker'

const offsetX = 15
const offsetY = 15
const safetyMargin = 20
let currentTranslateX = 0
let currentTranslateY = 0
let animationFrameId: number | null = null

const pipette = document.getElementById('pipette') as HTMLDivElement
const cube = document.getElementById('cube') as HTMLDivElement
const image = document.getElementById('image') as HTMLImageElement

const {width: pipetteWidth, height: pipetteHeight} = pipette.getBoundingClientRect()


function init() {
	document.addEventListener('click', clickPipetteHandler)
	document.addEventListener('mousemove', mouseMoveHandler)
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
	const result = await invoke<PipetteCapture>('capture_cursor_area', {x, y})

	image.src = result.image
	cube.style.background = result.color
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

init()
