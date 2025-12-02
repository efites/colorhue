import styles from './Pin.module.scss'
import {IColor} from '../../types/picker'
import {use} from 'react'
import {GlobalContext} from '../../app/contexts/Global'

export const Pin = (pin: IColor) => {
	const {addHistory} = use(GlobalContext)

	const clickHandler = (pin: IColor) => {
		addHistory(pin.color, pin.format, pin.alpha)
	}

	return <div
		className={styles.pin}
		style={{backgroundColor: pin.color}}
		onClick={() => clickHandler(pin)}
	>
		<div className={styles.cover} style={{backgroundColor: pin.color, opacity: 1 - pin.alpha / 100}}></div>
	</div>
}
