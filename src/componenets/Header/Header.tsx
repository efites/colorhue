import React, {useContext} from 'react'
import clsx from 'clsx'
import {GlobalContext, Mode} from '../../app/contexts/Global'
import Icon from '../Icon/Icon'
import styles from './Header.module.scss'


const buttons: Mode[] = ['solid', 'gradient'] as const

export const Header = () => {
	const {mode, setMode} = useContext(GlobalContext)

	return <header className={styles.header}>
		<div className={styles.modeBox}>
			{buttons.map(button => {
				return <button onClick={() => setMode(button)} className={clsx(styles.button, button === mode && styles.active)}>
					<Icon name={button} className={clsx(styles.icon, styles.solid, button === mode && styles.active)} />
				</button>
			})}
		</div>
		<div className={styles.modeBox}>
			SAVE
		</div>
	</header>
}
