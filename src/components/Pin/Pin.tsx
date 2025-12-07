import styles from './Pin.module.scss'
import {IColor} from '../../types/picker'
import {use} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
import {convertColor} from '../../shared/helpers/colors'

export const Pin = (pin: IColor) => {
	const {addHistory} = use(GlobalContext)

	const clickHandler = (pin: IColor) => {
		addHistory(pin.color, pin.format, pin.alpha)
	}

	console.log(pin.color)

	return (
		<div
			className={styles.pin}
			style={{
				backgroundColor:
					pin.format === 'hex' ? pin.color : convertColor(pin.color, 'rgb', 'hex'),
			}}
			onClick={() => clickHandler(pin)}>
			<div
				className={styles.cover}
				style={{
					backgroundColor:
						pin.format === 'hex' ? pin.color : convertColor(pin.color, 'rgb', 'hex'),
					opacity: 1 - pin.alpha / 100,
				}}></div>
		</div>
	)
}
