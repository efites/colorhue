import {useCallback, useRef, useState} from 'react'
import {toImageSampledColor, getRelativePercentPosition} from './visualizer.business'
import {IColor} from '@/model/color'

interface Position {
	x: number
	y: number
}

interface UseVisualizerImageStateParams {
	onColorChange: (next: IColor) => void
	getCurrentColor: () => IColor
}

export const useVisualizerImageState = ({
	onColorChange,
	getCurrentColor,
}: UseVisualizerImageStateParams) => {
	const [crossPosition, setCrossPosition] = useState<Position>({x: 50, y: 50})
	const imgRef = useRef<HTMLImageElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const lastPosition = useRef<Position>({x: -1, y: -1})

	const handleImageLoad = useCallback(() => {
		const image = imgRef.current
		const canvas = canvasRef.current

		if (!image || !canvas) return

		canvas.width = image.naturalWidth
		canvas.height = image.naturalHeight
		const ctx = canvas.getContext('2d')

		if (ctx) ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight)
	}, [])

	const updateByPointer = useCallback(
		(clientX: number, clientY: number) => {
			const image = imgRef.current
			const canvas = canvasRef.current

			if (!image || !canvas) return

			const position = getRelativePercentPosition(
				image.getBoundingClientRect(),
				clientX,
				clientY,
			)
			if (position.x === lastPosition.current.x && position.y === lastPosition.current.y)
				return

			lastPosition.current = position
			setCrossPosition(position)

			const ctx = canvas.getContext('2d')
			if (!ctx) return

			const natX = (position.x / 100) * image.naturalWidth
			const natY = (position.y / 100) * image.naturalHeight
			const pixel = ctx.getImageData(natX, natY, 1, 1).data
			const nextColor = toImageSampledColor(
				position,
				{r: pixel[0], g: pixel[1], b: pixel[2]},
				getCurrentColor().format,
			)

			if (nextColor.displayed === getCurrentColor().displayed) return
			onColorChange(nextColor)
		},
		[getCurrentColor, onColorChange],
	)

	const reset = useCallback(() => {
		const initialPosition = {x: 50, y: 50}
		setCrossPosition(initialPosition)
		lastPosition.current = initialPosition
	}, [])

	return {
		imgRef,
		canvasRef,
		crossPosition,
		handleImageLoad,
		updateByPointer,
		reset,
	}
}
