import clsx from 'clsx'
import {ChangeEvent, use, useEffect, useState} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
import Icon from '../Icon/Icon'
import styles from './Main.module.scss'
import {useColorPicker} from '../../app/hooks/useColorPicker'
import {RegularsExp} from '../../shared/consts/regexp'

export const Main = () => {
	const [code, setCode] = useState<string>('#ffffff')
	const [opacity, setOpacity] = useState<number>(100)
	const {mode, addHistory} = use(GlobalContext)
	const {color: _color, image, format, pickColor} = useColorPicker()

	const handlePickColor = async () => {
		await pickColor()
	}

	const changeCodeHandler = (event: ChangeEvent<HTMLInputElement>) => {
		event.preventDefault()
		setCode(event.target.value)
	}

	const expandHex = (value: string): string => {
		switch (value.length) {
			case 1:
				// "1" -> "111111"
				return value.repeat(6)
			case 2:
				// "12" -> "121212"
				return value.repeat(3)
			case 3:
				// "123" -> "112233"
				return value
					.split('')
					.map(char => char + char)
					.join('')
			case 4:
				// "1234" -> "112233"
				return value
					.substring(0, 3)
					.split('')
					.map(char => char + char)
					.join('')
			case 5:
				// "12345" -> "112233"
				return value
					.substring(0, 3)
					.split('')
					.map(char => char + char)
					.join('')
			default:
				return value
		}
	}

	const blurCodeHandler = (event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value.trim()

		switch (format) {
			case 'hex':
				// Remove '#' and cut: #123456
				const cleanHex = value.replace(/^#/, '').slice(0, 6)

				// Full hex
				if (RegularsExp.hex.test(cleanHex)) {
					const formatted = `#${cleanHex}`

					setCode(formatted)
					addHistory(formatted, 'hex')
					return
				}

				// Short hex
				if (RegularsExp.shortHex.test(cleanHex)) {
					const expanded = expandHex(cleanHex)
					const formatted = `#${expanded}`

					if (RegularsExp.hex.test(formatted)) {
						setCode(formatted)
						addHistory(formatted, 'hex')
						return
					}
				}
				break
			case 'rgb':
				// Remove ' ' and cut: rgb(255,255,255,0.99)
				const cleanRGB = value.replaceAll(' ', '').slice(0, 21)

				if (RegularsExp.rgb.test(cleanRGB)) {
					setCode(cleanRGB)
					addHistory(cleanRGB, 'hex')
					return
				}
				break
			default:
				const _exhaustiveCheck: never = format
				return
		}
	}

	const changeOpacityHandler = (event: ChangeEvent<HTMLInputElement>) => {
		const number = parseInt(event.target.value)

		if (isNaN(number)) return setOpacity(100)
		if (number > 100) return setOpacity(100)
		if (number < 0) return setOpacity(0)

		setOpacity(number)
	}

	const blurOpacityHandler = (event: ChangeEvent<HTMLInputElement>) => {
		if (event.target.value === '') {
			setOpacity(0)
		}
	}

	useEffect(() => {
		addHistory(_color, format)
		setCode(_color)
	}, [_color])

	return (
		<div className={styles.main}>
			<div className={styles.selection}>
				<div className={styles.wheel}>
					<div className={styles.circle}></div>
				</div>
				<div className={styles.windows}>
					<div className={clsx(styles.window, styles.screenshot)}>
						<img alt='screenshot' className={styles.screen} src={image} />
						<div className={styles.cross}></div>
					</div>
					<div className={clsx(styles.window, styles.brightness)}></div>
				</div>
			</div>
			<div className={clsx(styles.settings, mode === 'gradient' && styles.solid)}>
				<div className={styles.indication}>
					<div className={styles.gamma}>
						<button className={styles.pipette} type='button' onClick={handlePickColor}>
							<Icon
								className={clsx(styles.pipetteIcon, styles.active)}
								name='pipette'
							/>
						</button>
						<div className={styles.sliders}>
							<div className={clsx(styles.slider, styles.rainbow)}></div>
							<div className={clsx(styles.slider, styles.rgba)}></div>
						</div>
					</div>
					{mode === 'solid' && (
						<div className={styles.inputs}>
							<div className={styles.model}>
								<select className={styles.select}>
									<option value='HEX'>HEX</option>
									<option value='RGB'>RGB</option>
								</select>
								<Icon className={styles.arrow} name='arrow-down' />
							</div>
							<div className={styles.codes}>
								<div className={styles.codeWrapper}>
									<input
										className={styles.code}
										type='text'
										value={code.toUpperCase()}
										onChange={changeCodeHandler}
										onBlur={blurCodeHandler}
									/>
								</div>
								<div className={styles.percentages}>
									<input
										className={styles.opacity}
										maxLength={3}
										type='number'
										value={opacity}
										onChange={changeOpacityHandler}
										onBlur={blurOpacityHandler}
									/>
									<span className={styles.static}>%</span>
								</div>
							</div>
						</div>
					)}
				</div>
				{mode === 'solid' && (
					<div className={styles.triads}>
						<div className={styles.titles}>
							<h2 className={styles.title}>Monochromatic</h2>
						</div>
						<div className={styles.combinations}>
							<button className={styles.combination} type='button'>
								<Icon className={styles.combinationIcon} name='combination-1' />
							</button>
							<button
								className={clsx(styles.combination, styles.active)}
								type='button'>
								<Icon className={styles.combinationIcon} name='combination-2' />
							</button>
							<button className={styles.combination} type='button'>
								<Icon className={styles.combinationIcon} name='combination-3' />
							</button>
							<button className={styles.combination} type='button'>
								<Icon className={styles.combinationIcon} name='combination-4' />
							</button>
							<button className={styles.combination} type='button'>
								<Icon className={styles.combinationIcon} name='combination-5' />
							</button>
							<button className={styles.combination} type='button'>
								<Icon className={styles.combinationIcon} name='combination-6' />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
