import {
	ChangeEvent,
	Dispatch,
	RefObject,
	SetStateAction,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import styles from './Console.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {convertColor, validateColor} from '../../shared/helpers/colors'
import {IColor} from '../../types/picker'
import clsx from 'clsx'
import Icon from '../Icon/Icon'
import {Select} from '../Select/Select'
import {HarmonyButtons} from '../HarmonyButtons/HarmonyButtons'
import {useColorPicker} from '../../app/hooks/useColorPicker'

const formats: IColor['format'][] = ['hex', 'rgb'] as const

export const Console = () => {
	const {mode, addHistory} = useContext(GlobalContext)
	const {color, setColor} = useContext(GlobalContext)
	const {pickColor} = useColorPicker()

	const [hue, setHue] = useState<number>(50)
	// const [alpha, setAlpha] = useState<IColor['alpha']>(color.alpha)
	const rainbowRef = useRef<HTMLDivElement>(null)
	const alphaRef = useRef<HTMLDivElement>(null)

	const [сode, setCode] = useState<string>(color.displayed.toUpperCase())
	const [opacity, setOpacity] = useState<IColor['alpha']>(color.alpha)

	useEffect(() => {
		setCode(color.displayed.toUpperCase())
		setOpacity(color.alpha)
	}, [color])

	const handleFormatChange = (option: IColor['format']) => {
		setColor(convertColor(color, option))
	}

	const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
		setCode(event.target.value.toUpperCase())
	}

	const handleCodeBlur = (event: ChangeEvent<HTMLInputElement>) => {
		const result = validateColor(event.target.value)

		if (!result) {
			console.error('Color is not correct')
			setCode(color.displayed.toUpperCase())

			return
		}

		const newColor: IColor = {
			base: result.code,
			displayed: result.code,
			alpha: color.alpha,
			format: result.format,
			luminance: {shade: 0, tint: 0},
		}

		setColor(newColor)
		addHistory(newColor)
	}

	const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value
		setOpacity(parseInt(value.replaceAll('-', '').slice(0, 3)))
	}

	const handleOpacityBlur = (event: ChangeEvent<HTMLInputElement>) => {
		let alpha = parseInt(event.target.value)

		if (isNaN(alpha) || alpha > 100) alpha = 100
		else if (alpha < 0) alpha = 0

		const result = {...color, alpha}

		setColor(result)
		addHistory(result)
		setOpacity(alpha)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.currentTarget.blur()
		}
	}

	const handleDrag = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>,
		ref: RefObject<HTMLDivElement | null>,
		callback: Dispatch<SetStateAction<number>>,
	) => {
		let latestValue = 0

		const updateValue = (event: MouseEvent) => {
			if (!ref.current) return

			const rect = ref.current.getBoundingClientRect()
			const clientX = event.clientX

			let relativeX = clientX - rect.left
			let percentage = (relativeX / rect.width) * 100
			const finalValue = Math.max(0, Math.min(100, Math.round(percentage)))

			latestValue = finalValue
			callback(finalValue)
		}

		updateValue(event as unknown as MouseEvent)

		const onMouseMove = (event: MouseEvent) => updateValue(event)

		const onMouseUp = () => {
			const newColor: IColor = {
				...color,
				alpha: latestValue,
			}

			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)

			setColor(newColor)
			addHistory(newColor)
		}

		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
	}

	return (
		<div className={clsx(styles.settings, mode === 'gradient' && styles.solid)}>
			<div className={styles.indication}>
				<div className={styles.gamma}>
					<button className={styles.pipette} type='button' onClick={pickColor}>
						<Icon className={clsx(styles.pipetteIcon, styles.active)} name='pipette' />
					</button>

					<div className={styles.sliders}>
						<div
							className={clsx(styles.slider, styles.rainbow)}
							ref={rainbowRef}
							onMouseDown={event => handleDrag(event, rainbowRef, setHue)}>
							<div
								className={styles.opacityPin}
								style={{left: `${hue}%`, transform: `translate(${-hue}%, -50%)`}}
							/>
						</div>
						<div
							className={clsx(styles.slider, styles.rgba)}
							ref={alphaRef}
							onMouseDown={e => handleDrag(e, alphaRef, setOpacity)}>
							<div
								className={styles.cover}
								style={{
									background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, #ff0000 100%)`, // Замените #ff0000 на ваш цвет
								}}
							/>
							<div
								className={styles.opacityPin}
								style={{
									left: `${opacity}%`,
									transform: `translate(${-opacity}%, -50%)`,
								}}
							/>
						</div>

						<p>
							Hue: {hue} | Alpha: {opacity}
						</p>
					</div>
				</div>

				{mode === 'solid' && (
					<div className={styles.inputs}>
						<Select
							placeholder='Формат'
							selected={{
								label: color.format.toUpperCase(),
								value: color.format,
							}}
							options={formats.map(f => ({label: f.toUpperCase(), value: f}))}
							onChange={option => handleFormatChange(option.value)}
							icon='arrow-down'
						/>
						<div className={styles.codes}>
							<div className={styles.codeWrapper}>
								<input
									className={styles.code}
									type='text'
									value={сode}
									onChange={handleCodeChange}
									onBlur={handleCodeBlur}
									onKeyDown={onKeyDown}
								/>
							</div>
							<div className={styles.percentages}>
								<input
									className={styles.opacity}
									type='number'
									value={opacity}
									onChange={handleOpacityChange}
									onBlur={handleOpacityBlur}
									onKeyDown={onKeyDown}
								/>
								<span className={styles.static}>%</span>
							</div>
						</div>
					</div>
				)}
			</div>
			{mode === 'solid' && <HarmonyButtons />}
		</div>
	)
}
