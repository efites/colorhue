import {ChangeEvent, useContext, useEffect, useState} from 'react'
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
	const {mode} = useContext(GlobalContext)
	const {color, setColor} = useContext(GlobalContext)
	const {pickColor} = useColorPicker()
	const [сode, setCode] = useState<string>(color.displayed.toUpperCase())

	useEffect(() => {
		setCode(color.displayed.toUpperCase())
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
			setCode(color.displayed.toUpperCase())

			return
		}

		setColor({
			base: result.code,
			displayed: result.code,
			alpha: color.alpha,
			format: result.format,
			luminance: {shade: 0, tint: 0},
		})
		// Здесь должна быть ваша функция валидации, если её нет — сохраняем как есть
		// const updatedColor = {...localCode, base: localCode.displayed}
		// setColor(updatedColor)
		// addHistory(updatedColor)
	}

	const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.currentTarget.blur()
		}
	}

	const handleOpacityChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value)

		if (isNaN(value)) setColor(prev => ({...prev, alpha: 100}))
		else if (value > 100) setColor(prev => ({...prev, alpha: 100}))
		else if (value < 0) setColor(prev => ({...prev, alpha: 0}))
		else setColor(prev => ({...prev, alpha: value}))
	}

	// Сохранение прозрачности в глобальный стейт
	const handleOpacityBlur = () => {
		// const updatedColor = {...localCode, alpha: localOpacity}
		// setColor(updatedColor)
		// addHistory(updatedColor)
	}

	return (
		<div className={clsx(styles.settings, mode === 'gradient' && styles.solid)}>
			<div className={styles.indication}>
				<div className={styles.gamma}>
					<button className={styles.pipette} type='button' onClick={pickColor}>
						<Icon className={clsx(styles.pipetteIcon, styles.active)} name='pipette' />
					</button>

					<div className={styles.sliders}>
						<div className={clsx(styles.slider, styles.rainbow)}>
							<div className={styles.opacityPin} style={{left: '50%'}} />{' '}
							{/* Логика позиции пина */}
						</div>
						<div className={clsx(styles.slider, styles.rgba)}>
							<div
								className={styles.cover}
								style={{
									background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${convertColor(color, 'hex').displayed})`,
								}}
							/>
							<div
								className={styles.opacityPin}
								style={{left: `${color.alpha}%`}} // Пин двигается за процентами
							/>
						</div>
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
									value={color.alpha}
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
