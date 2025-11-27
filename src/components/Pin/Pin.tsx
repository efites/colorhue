import styles from './Pin.module.scss'
import {IColor} from '../../types/picker'
import {use} from 'react'
import {GlobalContext} from '../../app/contexts/Global'


export const Pin = (pin: IColor) => {
	const {addHistory} = use(GlobalContext)

	const clickHandler = (pin: IColor) => {
		addHistory(pin.color, pin.format)
	}

	return <div className={styles.pin} style={{backgroundColor: pin.color}} onClick={() => clickHandler(pin)}></div>
}
