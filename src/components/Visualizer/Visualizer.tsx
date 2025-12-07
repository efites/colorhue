import {useRef, useState, MouseEvent, useContext, useEffect} from 'react'
import clsx from 'clsx'
import styles from './Visualizer.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {convertColor} from '../../shared/helpers/colors'

export const Visualizer = ({image}: {image: string}) => {
	const {setColor, addHistory, color} = useContext(GlobalContext)

	const imgRef = useRef<HTMLImageElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const [crossPos, setCrossPos] = useState({x: 50, y: 50})
	const [isDragging, setIsDragging] = useState(false)

	useEffect(() => {
		setCrossPos({x: 50, y: 50})
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

	const handleUpdate = (event: MouseEvent<HTMLDivElement>) => {
		if (!imgRef.current || !canvasRef.current) return

		const rect = imgRef.current.getBoundingClientRect()
		const x = event.clientX - rect.left
		const y = event.clientY - rect.top

		let xPercent = (x / rect.width) * 100
		let yPercent = (y / rect.height) * 100

		xPercent = Math.max(0, Math.min(100, xPercent))
		yPercent = Math.max(0, Math.min(100, yPercent))

		setCrossPos({x: xPercent, y: yPercent})

		const ctx = canvasRef.current.getContext('2d')

		if (ctx) {
			const natX = (xPercent / 100) * imgRef.current.naturalWidth
			const natY = (yPercent / 100) * imgRef.current.naturalHeight

			const pixelData = ctx.getImageData(natX, natY, 1, 1).data

			switch (color.format) {
				case 'hex':
					const colorHex = convertColor(
						[pixelData[0], pixelData[1], pixelData[2]].join(', '),
						'rgb',
						'hex',
					)

					if (colorHex) {
						setColor({color: colorHex, format: 'hex', alpha: 100})
					}

					break
				case 'rgb':
					const colorRGB = convertColor(
						[pixelData[0], pixelData[1], pixelData[2]].join(', '),
						'rgb',
						'rgb',
					)

					if (colorRGB) {
						setColor({color: colorRGB, format: 'rgb', alpha: 100})
					}

					break
				default:
					break
			}
		}
	}

	const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
		setIsDragging(true)
		handleUpdate(event)
	}

	const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
		if (isDragging) {
			handleUpdate(event)
		}
	}

	const onMouseUp = () => {
		setIsDragging(false)
		addHistory(color.color, color.format, color.alpha)
	}

	const onMouseLeave = () => {
		setIsDragging(false)
	}

	return (
		<div className={styles.selection}>
			<div className={styles.wheel}>
				<div className={styles.circle}></div>
			</div>
			<div className={styles.windows}>
				<div
					className={clsx(styles.window, styles.screenshot)}
					onMouseDown={onMouseDown}
					onMouseMove={onMouseMove}
					onMouseUp={onMouseUp}
					onMouseLeave={onMouseLeave}
					onDragStart={event => event.preventDefault()}>
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
						style={{
							left: `${crossPos.x}%`,
							top: `${crossPos.y}%`,
						}}></div>
				</div>
				<div
					className={clsx(styles.window)}
					style={{
						background: `linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(255, 255, 255, 0)), linear-gradient(90deg, #ffffff, ${convertColor(color.color, color.format, 'hex')})`,
					}}></div>
			</div>
		</div>
	)
}
