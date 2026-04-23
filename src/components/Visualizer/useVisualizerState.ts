import {MouseEvent, useCallback, useContext, useEffect, useRef, useState} from 'react'
import {useAction, useAtom} from '@reatom/react'
import {colorAtom} from '@/app/model/color'
import {addHistory} from '@/app/model/history'
import {PipetteContext} from '@/app/contexts/Pipette'
import {convertColor, parseRgb, rgbToString} from '@/shared/helpers/colors'
import {IColor} from '@/types/picker'

type DragTarget = 'image' | 'gradient'

interface Position {
	x: number
	y: number
}

export const useVisualizerState = () => {
	const {image} = useContext(PipetteContext)
	const [color, setColor] = useAtom(colorAtom)
	const addHistoryAction = useAction(addHistory)

	const [imgCrossPos, setImgCrossPos] = useState<Position>({x: 50, y: 50})
	const [gradCrossPos, setGradCrossPos] = useState<Position>({x: 50, y: 50})
	const [activeDrag, setActiveDrag] = useState<DragTarget | null>(null)

	const imgRef = useRef<HTMLImageElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const gradRef = useRef<HTMLDivElement>(null)
	const activeDragRef = useRef<DragTarget | null>(null)
	const colorRef = useRef(color)
	const lastImgPos = useRef<Position>({x: -1, y: -1})
	const lastGradPos = useRef<Position>({x: -1, y: -1})

	const handleImageLoad = useCallback(() => {
		const img = imgRef.current
		const canvas = canvasRef.current

		if (!img || !canvas) return

		canvas.width = img.naturalWidth
		canvas.height = img.naturalHeight
		const ctx = canvas.getContext('2d')
		if (ctx) ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
	}, [])

	const handleImgUpdate = useCallback(
		(clientX: number, clientY: number) => {
			if (!imgRef.current || !canvasRef.current) return

			const rect = imgRef.current.getBoundingClientRect()
			const xPercent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
			const yPercent = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))

			if (xPercent === lastImgPos.current.x && yPercent === lastImgPos.current.y) return

			lastImgPos.current = {x: xPercent, y: yPercent}
			setImgCrossPos({x: xPercent, y: yPercent})

			const ctx = canvasRef.current.getContext('2d')
			if (!ctx) return

			const natX = (xPercent / 100) * imgRef.current.naturalWidth
			const natY = (yPercent / 100) * imgRef.current.naturalHeight
			const pixelData = ctx.getImageData(natX, natY, 1, 1).data
			const rgbString = rgbToString({r: pixelData[0], g: pixelData[1], b: pixelData[2]})

			const updated = convertColor(
				{
					alpha: 100,
					base: rgbString,
					format: 'rgb',
					displayed: rgbString,
					luminance: {tint: xPercent, shade: yPercent},
				},
				colorRef.current.format,
			)

			if (updated.displayed === colorRef.current.displayed) return
			setColor(updated)
		},
		[setColor],
	)

	const handleGradUpdate = useCallback(
		(clientX: number, clientY: number) => {
			if (!gradRef.current) return

			const rect = gradRef.current.getBoundingClientRect()
			const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
			const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))
			if (x === lastGradPos.current.x && y === lastGradPos.current.y) return

			lastGradPos.current = {x, y}
			const tint = 1 - x / 100
			const shade = y / 100
			const lerp = (start: number, end: number, t: number) => start + (end - start) * t

			const white = {r: 255, g: 255, b: 255}
			const baseColorRgbString = convertColor(colorRef.current, 'rgb').base
			const base = parseRgb(baseColorRgbString) ?? {r: 255, g: 255, b: 255}
			const black = {r: 0, g: 0, b: 0}

			const topR = lerp(base.r, white.r, tint)
			const topG = lerp(base.g, white.g, tint)
			const topB = lerp(base.b, white.b, tint)
			const r = Math.round(lerp(topR, black.r, shade))
			const g = Math.round(lerp(topG, black.g, shade))
			const b = Math.round(lerp(topB, black.b, shade))
			const currentRgbString = rgbToString({r, g, b})

			const currentColor = colorRef.current
			const updatedInRgb: IColor = {
				...currentColor,
				format: 'rgb',
				base: baseColorRgbString,
				displayed: currentRgbString,
				luminance: {tint, shade},
			}

			setColor(convertColor(updatedInRgb, currentColor.format))
			setGradCrossPos({x, y})
		},
		[setColor],
	)

	const onMouseDown = useCallback(
		(event: MouseEvent<HTMLDivElement>, target: DragTarget) => {
			setActiveDrag(target)
			if (target === 'image') handleImgUpdate(event.clientX, event.clientY)
			if (target === 'gradient') handleGradUpdate(event.clientX, event.clientY)
		},
		[handleImgUpdate, handleGradUpdate],
	)

	useEffect(() => {
		activeDragRef.current = activeDrag
	}, [activeDrag])

	useEffect(() => {
		colorRef.current = color
	}, [color])

	useEffect(() => {
		setImgCrossPos({x: 50, y: 50})
		lastImgPos.current = {x: 50, y: 50}
	}, [image])

	useEffect(() => {
		const handleGlobalMouseMove = (event: globalThis.MouseEvent) => {
			if (!activeDragRef.current) return
			if (activeDragRef.current === 'image') handleImgUpdate(event.clientX, event.clientY)
			if (activeDragRef.current === 'gradient') handleGradUpdate(event.clientX, event.clientY)
		}

		const handleGlobalMouseUp = () => {
			if (!activeDragRef.current) return
			addHistoryAction(colorRef.current)
			setActiveDrag(null)
		}

		if (activeDrag) {
			window.addEventListener('mousemove', handleGlobalMouseMove)
			window.addEventListener('mouseup', handleGlobalMouseUp)
		}

		return () => {
			window.removeEventListener('mousemove', handleGlobalMouseMove)
			window.removeEventListener('mouseup', handleGlobalMouseUp)
		}
	}, [activeDrag, handleImgUpdate, handleGradUpdate, addHistoryAction])

	return {
		color,
		image,
		imgRef,
		canvasRef,
		gradRef,
		imgCrossPos,
		gradCrossPos,
		handleImageLoad,
		onMouseDown,
	}
}
