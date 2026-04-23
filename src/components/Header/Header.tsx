import clsx from 'clsx'
import {useAtom} from '@reatom/react'

import type {Mode} from '@/app/model/global'

import {modeAtom} from '@/app/model/mode'
import Icon from '../Icon/Icon'

import styles from './Header.module.scss'
import {useAutoWindowSize} from '../../app/hooks/useWindowResize'

const buttons: Mode[] = ['solid', 'gradient'] as const

export const Header = () => {
	const [mode, setMode] = useAtom(modeAtom)
	const {setWindowSize} = useAutoWindowSize()

	const changeModeHandler = (mode: Mode) => {
		setMode(mode)
		setWindowSize()
	}

	return (
		<header className={styles.header}>
			<div className={styles.modeBox}>
				{buttons.map(button => {
					return (
						<button
							key={button}
							className={clsx(styles.button, button === mode && styles.active)}
							type='button'
							onClick={() => changeModeHandler(button)}>
							<Icon
								className={clsx(
									styles.icon,
									styles.solid,
									button === mode && styles.active,
								)}
								name={button}
							/>
						</button>
					)
				})}
			</div>
			<div className={styles.modeBox}>
				<button className={clsx(styles.action, styles.import)} type='button'>
					Import
				</button>
				<button className={clsx(styles.action, styles.export)} type='button'>
					Save as
				</button>
			</div>
		</header>
	)
}
