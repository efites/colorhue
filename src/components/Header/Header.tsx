import clsx from 'clsx'
import React, {use} from 'react'

import type { Mode} from '../../app/contexts/Global';

import {GlobalContext} from '../../app/contexts/Global'
import Icon from '../Icon/Icon'

import styles from './Header.module.scss'

const buttons: Mode[] = ['solid', 'gradient'] as const

export const Header = () => {
	const {mode, setMode} = use(GlobalContext)

	return (
		<header className={styles.header}>
			<div className={styles.modeBox}>
				{buttons.map(button => {
					return (
						<button
							key={button}
							className={clsx(styles.button, button === mode && styles.active)}
							type='button'
							onClick={() => setMode(button)}>
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
			<div className={styles.modeBox}>SAVE</div>
		</header>
	)
}
