import {MouseEvent, useCallback, useEffect, useRef, useState} from 'react'
import {useAction, useAtom} from '@reatom/react'
import {colorAtom} from '@/app/model/color'
import {addHistory} from '@/app/model/history'
import {pipetteImageAtom} from '@/app/model/pipette'
import {useVisualizerImageState} from './useVisualizerImageState'
import {useVisualizerGradientState} from './useVisualizerGradientState'

type DragTarget = 'image' | 'gradient'

export const useVisualizerState = () => {
	const [color, setColor] = useAtom(colorAtom)
	const [image] = useAtom(pipetteImageAtom)
	const addHistoryAction = useAction(addHistory)

	const [activeDrag, setActiveDrag] = useState<DragTarget | null>(null)

	const activeDragRef = useRef<DragTarget | null>(null)
	const colorRef = useRef(color)
	const imageState = useVisualizerImageState({
		onColorChange: setColor,
		getCurrentColor: () => colorRef.current,
	})
	const gradientState = useVisualizerGradientState({
		onColorChange: setColor,
		getCurrentColor: () => colorRef.current,
	})
	const {imgRef, canvasRef, crossPosition: imgCrossPos, handleImageLoad, updateByPointer, reset} = imageState
	const {gradRef, crossPosition: gradCrossPos, updateByPointer: updateGradientByPointer} = gradientState

	const onMouseDown = useCallback(
		(event: MouseEvent<HTMLDivElement>, target: DragTarget) => {
			setActiveDrag(target)
			if (target === 'image') updateByPointer(event.clientX, event.clientY)
			if (target === 'gradient') updateGradientByPointer(event.clientX, event.clientY)
		},
		[updateByPointer, updateGradientByPointer],
	)

	useEffect(() => {
		activeDragRef.current = activeDrag
	}, [activeDrag])

	useEffect(() => {
		colorRef.current = color
	}, [color])

	useEffect(() => {
		reset()
	}, [image, reset])

	useEffect(() => {
		const handleGlobalMouseMove = (event: globalThis.MouseEvent) => {
			if (!activeDragRef.current) return
			if (activeDragRef.current === 'image') updateByPointer(event.clientX, event.clientY)
			if (activeDragRef.current === 'gradient') updateGradientByPointer(event.clientX, event.clientY)
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
	}, [activeDrag, updateByPointer, updateGradientByPointer, addHistoryAction])

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
