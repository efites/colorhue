import {useRef, useState, MouseEvent, useContext, useEffect} from 'react'
import clsx from 'clsx'
import styles from './Visualizer.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {convertColor} from '../../shared/helpers/colors'
import {IColor} from '@/types/picker'

export const Visualizer = ({image}: {image: string}) => {
	const {setColor, addHistory, color} = useContext(GlobalContext)
	const imgRef = useRef<HTMLImageElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const gradRef = useRef<HTMLDivElement>(null)

	const [imgCrossPos, setImgCrossPos] = useState({x: 50, y: 50})
	const [gradCrossPos, setGradCrossPos] = useState({x: 50, y: 50})

	// Вводим локальный стейт для "Основы" градиента
	const [baseColor, setBaseColor] = useState<IColor['base']>(color.base)

	const [activeDrag, setActiveDrag] = useState<'image' | 'gradient' | null>(null)

	useEffect(() => {
		setImgCrossPos({x: 50, y: 50})
	}, [image])

	// Синхронизация: Если цвет поменялся извне (инпут) или с картинки,
	// мы обновляем базу. Но если мы сами сейчас тянем градиент - базу не трогаем.
	useEffect(() => {
		if (activeDrag !== 'gradient') {
			setBaseColor(color.base)
		}
	}, [color.base, activeDrag])

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
			const rgbString = `${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`

			// При выборе нового цвета с картинки:
			// tint = 0, shade = 0 (чистый цвет, правый верхний угол градиента)
			updateGlobalColor({
				...color,
				base: rgbString,
				format: 'rgb',
				displayed: rgbString,
				luminance: {tint: 0, shade: 0},
			})
			setGradCrossPos({x: 100, y: 0})
		}
	}

	const handleGradUpdate = (event: MouseEvent<HTMLDivElement>) => {
		if (!gradRef.current) return

		const rect = gradRef.current.getBoundingClientRect()
		let xPercent = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
		let yPercent = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))

		setGradCrossPos({x: xPercent, y: yPercent})

		/**
		 * ЛОГИКА РАСЧЕТА:
		 * В градиентном квадрате:
		 * Слева (x=0) - белый, Справа (x=100) - базовый цвет.
		 * Сверху (y=0) - цвет, Снизу (y=100) - черный.
		 */

		// Tint (Оттенок): 1 — это полностью белый.
		// Чем левее курсор (меньше x), тем больше белого.
		const tint = 1 - xPercent / 100

		// Shade (Полутон): 1 — это полностью черный.
		// Чем ниже курсор (больше y), тем больше черного.
		const shade = yPercent / 100

		// Обновляем глобальное состояние, сохраняя текущую "базу"
		updateGlobalColor({...color, luminance: {tint, shade}})
	}

	const updateGlobalColor = (color: IColor) => {
		const format = color.format
		const alpha = color.alpha

		// Конвертируем базовый цвет в нужный формат, если нужно
		// В этой логике color.color всегда остается "чистым" цветом-основой
		const formattedBase = convertColor(color, 'hex').base

		if (formattedBase) {
			setColor({
				base: formattedBase,
				displayed: formattedBase,
				luminance: color.luminance, // Теперь это объект {tint, shade}
				format,
				alpha,
			})
		}
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
						background: `linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(255, 255, 255, 0)), linear-gradient(90deg, #ffffff, ${baseColor})})`,
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
