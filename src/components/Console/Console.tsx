import {ChangeEvent, Dispatch, RefObject, SetStateAction, useEffect, useRef, useState} from 'react'
import styles from './Console.module.scss'
import {
	convertColor,
	getColorByHueOffset,
	getHueOffset,
	validateColor,
} from '../../shared/helpers/colors'
import {IColor} from '../../types/picker'
import clsx from 'clsx'
import Icon from '../Icon/Icon'
import {Select} from '../Select/Select'
import {HarmonyButtons} from '../HarmonyButtons/HarmonyButtons'
import {FORMATS} from '../../shared/consts/colors'
import {useAction, useAtom} from '@reatom/react'
import {modeAtom} from '@/app/model/mode'
import {addHistory} from '@/app/model/history'
import {colorAtom} from '@/app/model/color'
import {pickColor, pipettePickedColorAtom} from '@/app/model/pipette'

export const Console = () => {
	const [mode] = useAtom(modeAtom)
	const [color, setColor] = useAtom(colorAtom)
	const [pickedColor] = useAtom(pipettePickedColorAtom)
	const addHistoryAction = useAction(addHistory)
	const pickColorAction = useAction(pickColor)

	const rainbowRef = useRef<HTMLDivElement>(null)
	const alphaRef = useRef<HTMLDivElement>(null)

	const [hue, setHue] = useState<number>(getHueOffset(color) ?? 50)
	const [opacity, setOpacity] = useState<IColor['alpha']>(color.alpha)
	const [сode, setCode] = useState<string>(color.displayed.toUpperCase())

	useEffect(() => {
		setColor(pickedColor)
		addHistoryAction(pickedColor)
	}, [pickedColor, setColor, addHistoryAction])

	useEffect(() => {
		setCode(color.displayed.toUpperCase())
		setOpacity(color.alpha)
	}, [color.displayed, color.alpha])

	useEffect(() => {
		const newHue = getHueOffset(color)
		if (newHue !== undefined && newHue !== null) {
			setHue(newHue)
		}
	}, [color.base])

	const pickColorHandler = async () => {
		await pickColorAction()
	}

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
		addHistoryAction(newColor)
	}

	const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value
		setOpacity(parseInt(value.replaceAll('-', '').slice(0, 3)))
	}

	const handleOpacityBlur = (event: ChangeEvent<HTMLInputElement>) => {
		let alpha = parseInt(event.target.value)

		if (isNaN(alpha) || alpha > 100) alpha = 100
		else if (alpha < 0) alpha = 0

		if (alpha === opacity) return

		const result = {...color, alpha}

		setColor(result)
		addHistoryAction(result)
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
		onEnd: (value: number) => void,
	) => {
		let latestValue = 0

		const updateValue = (e: MouseEvent | React.MouseEvent) => {
			if (!ref.current) return
			const rect = ref.current.getBoundingClientRect()
			const clientX = e.clientX
			let relativeX = clientX - rect.left
			let percentage = (relativeX / rect.width) * 100
			const finalValue = Math.max(0, Math.min(100, Math.round(percentage)))

			latestValue = finalValue
			callback(finalValue)
		}

		updateValue(event)

		const onMouseMove = (e: MouseEvent) => updateValue(e)

		const onMouseUp = () => {
			onEnd(latestValue)

			window.removeEventListener('mousemove', onMouseMove)
			window.removeEventListener('mouseup', onMouseUp)
		}

		window.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp)
	}

	return (
		<div className={clsx(styles.settings, mode === 'gradient' && styles.solid)}>
			<div className={styles.indication}>
				<div className={styles.gamma}>
					<button className={styles.pipette} type='button' onClick={pickColorHandler}>
						<Icon className={clsx(styles.pipetteIcon, styles.active)} name='pipette' />
					</button>

					<div className={styles.sliders}>
						<div
							className={clsx(styles.slider, styles.rainbow)}
							ref={rainbowRef}
							onMouseDown={event =>
								handleDrag(event, rainbowRef, setHue, value => {
									const hex = getColorByHueOffset(value)

									if (hex === convertColor(color, 'hex').base) return

									const newColor = {...color, base: hex, displayed: hex}
									setColor(newColor)
									addHistoryAction(newColor)
								})
							}>
							<div className={styles.line}>
								<div
									className={styles.opacityPin}
									style={{
										left: `calc(${hue}% + 0px)`,
										transform: `translate(-50%, -50%)`,
										// transform: `translate(${-hue}%, -50%)`
									}}
								/>
							</div>
						</div>
						<div
							className={clsx(styles.slider, styles.rgba)}
							ref={alphaRef}
							onMouseDown={event =>
								handleDrag(event, alphaRef, setOpacity, value => {
									if (value === color.alpha) return

									const newColor = {...color, alpha: value}
									setColor(newColor)
									addHistoryAction(newColor)
								})
							}>
							<div
								className={styles.cover}
								style={{
									background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${convertColor(color, 'hex').displayed} 100%)`, // Замените #ff0000 на ваш цвет
								}}
							/>
							<div
								className={styles.opacityPin}
								style={{
									left: `calc(${opacity}% + 0px)`,
									transform: `translate(-50%, -50%)`,
									// transform: `translate(${-opacity}%, -50%)`,
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
							options={FORMATS.map(f => ({label: f.toUpperCase(), value: f}))}
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
