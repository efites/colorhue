import {useCallback, useRef, useState} from 'react'
import {convertColor} from '@/shared/helpers/colors'
import {getRelativePercentPosition, toLuminanceColor} from './visualizer.business'
import {IColor} from '@/model/color'

interface Position {
	x: number
	y: number
}

interface UseVisualizerGradientStateParams {
	onColorChange: (next: IColor) => void
	getCurrentColor: () => IColor
}

export const useVisualizerGradientState = ({
	onColorChange,
	getCurrentColor,
}: UseVisualizerGradientStateParams) => {
	const [crossPosition, setCrossPosition] = useState<Position>({x: 50, y: 50})
	const gradRef = useRef<HTMLDivElement>(null)
	const lastPosition = useRef<Position>({x: -1, y: -1})

	const updateByPointer = useCallback(
		(clientX: number, clientY: number) => {
			const grad = gradRef.current
			if (!grad) return

			const position = getRelativePercentPosition(
				grad.getBoundingClientRect(),
				clientX,
				clientY,
			)
			if (position.x === lastPosition.current.x && position.y === lastPosition.current.y)
				return

			lastPosition.current = position
			setCrossPosition(position)

			const currentColor = getCurrentColor()
			const baseRgb = convertColor(currentColor, 'rgb').base
			const nextColor = toLuminanceColor(currentColor, position, baseRgb)

			onColorChange(convertColor(nextColor, currentColor.format))
		},
		[getCurrentColor, onColorChange],
	)

	return {
		gradRef,
		crossPosition,
		updateByPointer,
	}
}
