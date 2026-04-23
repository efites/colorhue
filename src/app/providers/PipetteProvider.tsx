import {ReactNode, useCallback, useContext, useEffect, useRef} from 'react'
import {useColorPicker} from '../hooks/useColorPicker'
import {PipetteContext} from '../contexts/Pipette'
import {GlobalContext} from '../contexts/Global'
import {convertColor, rgbToString} from '@/shared/helpers/colors'

interface PipetteProviderProps {
	children: ReactNode
}

export const PipetteProvider = ({children}: PipetteProviderProps) => {
	const {color, setColor, addHistory} = useContext(GlobalContext)
	const {image} = useContext(PipetteContext)
	const picker = useColorPicker()

	const refs = {
		img: useRef<HTMLImageElement>(null),
		canvas: useRef<HTMLCanvasElement>(null),
		grad: useRef<HTMLDivElement>(null),
		color: useRef(color),
	}

	useEffect(() => {
		refs.color.current = color
	}, [color])

	const updateFromImage = useCallback(
		(clientX: number, clientY: number) => {
			const img = refs.img.current
			const canvas = refs.canvas.current
			if (!img || !canvas) return

			const rect = img.getBoundingClientRect()
			const xPercent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
			const yPercent = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))

			const ctx = canvas.getContext('2d')
			if (ctx) {
				const natX = (xPercent / 100) * img.naturalWidth
				const natY = (yPercent / 100) * img.naturalHeight
				const pixel = ctx.getImageData(natX, natY, 1, 1).data
				const rgb = rgbToString({r: pixel[0], g: pixel[1], b: pixel[2]})

				setColor(
					convertColor(
						{
							...refs.color.current,
							base: rgb,
							displayed: rgb,
							format: 'rgb',
							luminance: {tint: xPercent, shade: yPercent},
						},
						refs.color.current.format,
					),
				)
			}
		},
		[setColor],
	)

	// Логика обновления из градиентного квадрата
	const updateFromGradient = useCallback(
		(clientX: number, clientY: number) => {
			if (!refs.grad.current) return

			const rect = refs.grad.current.getBoundingClientRect()
			const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
			const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))

			// ... тут твоя математика расчета lerp (вынесена для чистоты)
			// const updated = calculateGradientColor(x, y, refs.color.current)
			// setColor(updated)
		},
		[setColor],
	)

	const value = {
		color,
		image,
		refs,
		updateFromImage,
		updateFromGradient,
		commit: () => addHistory(refs.color.current),
	}

	return <PipetteContext.Provider value={picker}>{children}</PipetteContext.Provider>
}
