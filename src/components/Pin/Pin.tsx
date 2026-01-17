import styles from './Pin.module.scss'
import {IColor} from '../../types/picker'
import {use} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
import {convertColor} from '../../shared/helpers/colors'

export const Pin = ({pin}: {pin: IColor}) => {
	const {addHistory} = use(GlobalContext)

	const clickHandler = (pin: IColor) => {
		// TODO: точно ли нужно добавление цвтета в историю? В useHistory проверка по отображаемому цвету
		addHistory(pin)
	}

	return (
		<div
			className={styles.pin}
			style={{
				backgroundColor:
					pin.format === 'hex' ? pin.displayed : convertColor(pin.displayed, 'rgb', 'hex'),
			}}
			onClick={() => clickHandler(pin)}>
			<div
				className={styles.cover}
				style={{
					backgroundColor:
						pin.format === 'hex' ? pin.displayed : convertColor(pin.displayed, 'rgb', 'hex'),
					opacity: 1 - pin.alpha / 100,
				}}></div>
		</div>
	)
}
