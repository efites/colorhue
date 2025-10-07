import clsx from 'clsx'
import {use, useState} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
import ScreenFallack from '../../shared/images/screen.png'
import Icon from '../Icon/Icon'
import styles from './Main.module.scss'
import {invoke} from '@tauri-apps/api/core'
import {listen} from '@tauri-apps/api/event'


export interface IPippete {
	image: string
	color: string
}

interface ICursorPosition {
	x: number
	y: number
}

export const Main = () => {
	const {mode} = use(GlobalContext)
	const [color, setSelectedColor] = useState<string>('#FFFFFF')
	const [image, setImage] = useState<string>(ScreenFallack)

	const handlePickColor = async () => {
		try {
			await invoke('create_overlay', {windowName: 'picker'})

			listen<ICursorPosition>('send_cursor_position', async (event) => {
				const {x, y} = event.payload

				const result = await invoke<IPippete>('capture_cursor_area', {x, y})

				setImage(result.image ?? ScreenFallack)
				setSelectedColor(result.color)
			})
		} catch (err) {
			console.error('Ошибка выбора цвета:', err)
		}
	}

	return (
		<div className={styles.main}>
			<div className={styles.selection}>
				<div className={styles.wheel}>
					<div className={styles.circle}></div>
				</div>
				<div className={styles.windows}>
					<div className={clsx(styles.window, styles.screenshot)}>
						<img
							alt='screenshot'
							className={styles.screen}
							src={image}
							onError={() => setImage(ScreenFallack)}
						/>
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
									<input className={styles.code} type='text' />
								</div>
								<div className={styles.percentages}>
									<input className={styles.opacity} maxLength={3} type='text' />
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
