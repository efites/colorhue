import {useRef, useState, MouseEvent, useContext, useEffect} from 'react'
import clsx from 'clsx'
import styles from './Visualizer.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {convertColor, parseRgb} from '../../shared/helpers/colors'

export const Visualizer = ({image}: {image: string}) => {
	const {setColor, addHistory, color} = useContext(GlobalContext)
	const imgRef = useRef<HTMLImageElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const gradRef = useRef<HTMLDivElement>(null)

	const [imgCrossPos, setImgCrossPos] = useState({x: 50, y: 50})
	const [gradCrossPos, setGradCrossPos] = useState({x: 50, y: 50})

	// Вводим локальный стейт для "Основы" градиента
	const [baseColor, setBaseColor] = useState(color.color)

	const [activeDrag, setActiveDrag] = useState<'image' | 'gradient' | null>(null)

	useEffect(() => {
		setImgCrossPos({x: 50, y: 50})
	}, [image])

	// Синхронизация: Если цвет поменялся извне (инпут) или с картинки,
	// мы обновляем базу. Но если мы сами сейчас тянем градиент - базу не трогаем.
	useEffect(() => {
		if (activeDrag !== 'gradient') {
			setBaseColor(color.color)
		}
	}, [color.color, activeDrag])

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

		let xPercent = (x / rect.width) * 100
		let yPercent = (y / rect.height) * 100

		xPercent = Math.max(0, Math.min(100, xPercent))
		yPercent = Math.max(0, Math.min(100, yPercent))

		setImgCrossPos({x: xPercent, y: yPercent})

		const ctx = canvasRef.current.getContext('2d')

		if (ctx) {
            const natX = (xPercent / 100) * imgRef.current.naturalWidth
            const natY = (yPercent / 100) * imgRef.current.naturalHeight
            const pixelData = ctx.getImageData(natX, natY, 1, 1).data
            const rgbString = `${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}`

            // Когда берем с картинки — и база, и основной цвет одинаковы
            updateGlobalColor(rgbString, rgbString)

            // Сбрасываем прицел градиента в правый верхний угол (100% насыщенность, 100% яркость)
            setGradCrossPos({ x: 100, y: 0 })
        }
	}

	const handleGradUpdate = (event: MouseEvent<HTMLDivElement>) => {
		if (!gradRef.current) return

		const rect = gradRef.current.getBoundingClientRect()
		let xPercent = ((event.clientX - rect.left) / rect.width) * 100
		let yPercent = ((event.clientY - rect.top) / rect.height) * 100

		xPercent = Math.max(0, Math.min(100, xPercent))
		yPercent = Math.max(0, Math.min(100, yPercent))

		setGradCrossPos({x: xPercent, y: yPercent})

		// Берем БАЗОВЫЙ цвет из контекста
		const baseRgb = convertColor(color.color, color.format, 'rgb')
		console.log(color)
		if (!baseRgb) return

		const {r, g, b} = parseRgb(baseRgb) ?? {r: 0, g: 0, b: 0}

		// Математика (Saturate & Value)
		// xPercent — это насыщенность (от белого к базе)
		// yPercent — это яркость (от цвета к черному)

		const ratioX = xPercent / 100 // 0 слева, 1 справа
		const ratioY = 1 - (yPercent / 100) // 1 вверху, 0 внизу

		// 1. Смешиваем белый и базовый цвет (горизонталь)
		const r1 = 255 + (r - 255) * ratioX
		const g1 = 255 + (g - 255) * ratioX
		const b1 = 255 + (b - 255) * ratioX

		// 2. Применяем яркость (вертикаль)
		const finalR = Math.round(r1 * ratioY)
		const finalG = Math.round(g1 * ratioY)
		const finalB = Math.round(b1 * ratioY)

		const finalRgb = `${finalR}, ${finalG}, ${finalB}`

		// Обновляем только текущий цвет, НЕ меняя базу
		updateGlobalColor(finalRgb, color.color)
	}

	const updateGlobalColor = (newColor: string, newBase: string) => {
		const format = color.format
		const alpha = color.alpha

		// Конвертируем оба цвета в нужный формат
		const formattedColor = format === 'hex' ? convertColor(newColor, 'rgb', 'hex') : newColor
		const formattedBase = format === 'hex' ? convertColor(newBase, 'rgb', 'hex') : newBase

		if (formattedColor && formattedBase) {
			setColor({
				color: formattedBase,
				luminance: formattedColor,
				format,
				alpha
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
		if (activeDrag) addHistory(color.color, color.format, color.alpha)
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
						background: `linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(255, 255, 255, 0)), linear-gradient(90deg, #ffffff, ${convertColor(baseColor, color.format, 'hex')})`,
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
