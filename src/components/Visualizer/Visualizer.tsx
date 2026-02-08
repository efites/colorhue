import {useRef, useState, MouseEvent, useContext, useEffect} from 'react'
import clsx from 'clsx'
import styles from './Visualizer.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {convertColor, parseHex, parseRgb, rgbToHex, rgbToString} from '../../shared/helpers/colors'
import {IColor} from '@/types/picker'

export const Visualizer = ({image}: {image: string}) => {
	const {setColor, addHistory, color} = useContext(GlobalContext)
	const imgRef = useRef<HTMLImageElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const gradRef = useRef<HTMLDivElement>(null)

	const [imgCrossPos, setImgCrossPos] = useState({x: 50, y: 50})
	const [gradCrossPos, setGradCrossPos] = useState({x: 50, y: 50})
	const [activeDrag, setActiveDrag] = useState<'image' | 'gradient' | null>(null)

	useEffect(() => {
		setImgCrossPos({x: 50, y: 50})
	}, [image])

	const handleImageLoad = () => {
		const img = imgRef.current
		const canvas = canvasRef.current

		if (img && canvas) {
			canvas.width = img.naturalWidth
			canvas.height = img.naturalHeight
			const ctx = canvas.getContext('2d')

			if (ctx) {
				ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight)
			}
		}
	}

	const handleImgUpdate = (event: MouseEvent<HTMLDivElement>) => {
		if (!imgRef.current || !canvasRef.current) return

		const rect = imgRef.current.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top

		let xPercent = Math.max(0, Math.min(100, (x / rect.width) * 100))
		let yPercent = Math.max(0, Math.min(100, (y / rect.height) * 100))

		setImgCrossPos({x: xPercent, y: yPercent})

		const ctx = canvasRef.current.getContext('2d')
		if (ctx) {
			const natX = (xPercent / 100) * imgRef.current.naturalWidth
			const natY = (yPercent / 100) * imgRef.current.naturalHeight
			const pixelData = ctx.getImageData(natX, natY, 1, 1).data
			const rgbString = rgbToString({r: pixelData[0], g: pixelData[1], b: pixelData[2]})

			// При выборе нового цвета с картинки:
			// tint = 0, shade = 0 (чистый цвет, правый верхний угол градиента)
			const updated = convertColor({
				alpha: 100,
				base: rgbString,
				format: 'rgb',
				displayed: rgbString,
				luminance: {tint: 0, shade: 0},
			}, color.format)

			updateGlobalColor(updated)
			setGradCrossPos({x: 100, y: 0})
		}
	}

	const handleGradUpdate = (event: MouseEvent<HTMLDivElement>) => {
		if (!gradRef.current) return

		const rect = gradRef.current.getBoundingClientRect()
		let x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
		let y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))

		const tint = 1 - x / 100 // Оставляем как есть или можно убрать инверсию
		const shade = y / 100

		// Функция для линейной интерполяции между двумя цветами
		const lerp = (start: number, end: number, t: number): number => {
			return start + (end - start) * t
		}

		// ИСПРАВЛЕНИЕ: Меняем местами белый и базовый цвет
		const white = {r: 255, g: 255, b: 255} // ПРАВЫЙ верхний (был левый)
		const base = parseRgb(convertColor(color, 'rgb').base) ?? {r: 255, g: 255, b: 255} // ЛЕВЫЙ верхний (был правый)
		const black = {r: 0, g: 0, b: 0} // Оба нижних

		// 1. Интерполируем по верхней грани (от base к белому)
		const topR = lerp(base.r, white.r, tint) // Меняем порядок
		const topG = lerp(base.g, white.g, tint) // Меняем порядок
		const topB = lerp(base.b, white.b, tint) // Меняем порядок

		// 2. Интерполируем по нижней грани (от черного к черному - просто черный)
		const bottomR = black.r
		const bottomG = black.g
		const bottomB = black.b

		// 3. Интерполируем по вертикали (от верхнего цвета к нижнему)
		let r = lerp(topR, bottomR, shade)
		let g = lerp(topG, bottomG, shade)
		let b = lerp(topB, bottomB, shade)

		// Округляем и ограничиваем значения
		r = Math.round(Math.max(0, Math.min(255, r)))
		g = Math.round(Math.max(0, Math.min(255, g)))
		b = Math.round(Math.max(0, Math.min(255, b)))

		setColor(prev => ({
			...prev,
			displayed: rgbToHex({r, g, b}),
			luminance: {
				tint,
				shade,
			},
		}))
	}

	const updateGlobalColor = (color: IColor) => {
		const format = color.format
		const alpha = color.alpha

		// Конвертируем базовый цвет в нужный формат, если нужно
		// В этой логике color.color всегда остается "чистым" цветом-основой
		// const formattedBase = convertColor(color, 'hex').base

		setColor({
			base: color.base,
			displayed: color.displayed,
			luminance: color.luminance, // Теперь это объект {tint, shade}
			format,
			alpha,
		})
		// if (formattedBase) {
		// }
	}

	const onMouseDown = (event: MouseEvent<HTMLDivElement>, target: 'image' | 'gradient') => {
		setActiveDrag(target)
		if (target === 'image') handleImgUpdate(event)
		if (target === 'gradient') handleGradUpdate(event)
	}

	const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
		if (activeDrag === 'image') handleImgUpdate(event)
		else if (activeDrag === 'gradient') handleGradUpdate(event)
	}

	const onMouseUp = () => {
		if (activeDrag) addHistory(color)
		setActiveDrag(null)
	}

	const onMouseLeave = () => {
		setActiveDrag(null)
	}

	return (
		<div className={styles.selection}>
			<div className={styles.wheel}>
				<div className={styles.circle}>
					<div className={styles.cursor} style={{left: '40%', top: '40%'}}></div>
				</div>
			</div>
			<div className={styles.windows}>
				{/* Image Window */}
				<div
					className={clsx(styles.window, styles.screenshot)}
					onMouseDown={e => onMouseDown(e, 'image')}
					onMouseMove={onMouseMove}
					onMouseUp={onMouseUp}
					onMouseLeave={onMouseLeave}
					onDragStart={e => e.preventDefault()}>
					<canvas ref={canvasRef} style={{display: 'none'}} />
					<img
						ref={imgRef}
						alt='screenshot'
						className={styles.screen}
						src={image}
						onLoad={handleImageLoad}
						crossOrigin='anonymous'
					/>
					<div
						className={styles.cross}
						style={{left: `${imgCrossPos.x}%`, top: `${imgCrossPos.y}%`}}></div>
				</div>

				{/* Gradient Window */}
				<div
					ref={gradRef}
					className={clsx(styles.window, styles.screenshot)}
					// ВАЖНО: Используем baseColor для фона
					style={{
						// background: 'red'
						// background: `linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(255, 255, 255, 0)), linear-gradient(90deg, #ffffff, blue)})`,
						background: `linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(255, 255, 255, 0)), linear-gradient(90deg, #ffffff, ${convertColor(color, 'hex').base})`,
					}}
					onMouseDown={e => onMouseDown(e, 'gradient')}
					onMouseMove={onMouseMove}
					onMouseUp={onMouseUp}
					onMouseLeave={onMouseLeave}
					onDragStart={e => e.preventDefault()}>
					<div
						className={styles.cross}
						style={{left: `${gradCrossPos.x}%`, top: `${gradCrossPos.y}%`}}></div>
				</div>
			</div>
		</div>
	)
}
