import styles from './Pin.module.scss'
import {convertColor} from '../../shared/helpers/colors'
import {useAction, useAtom} from '@reatom/react'
import {addHistory} from '@/app/model/history'
import {colorAtom, IColor} from '@/app/model/color'

export const Pin = ({pin}: {pin: IColor}) => {
	const [color] = useAtom(colorAtom)
	const addHistoryAction = useAction(addHistory)

	const clickHandler = (pin: IColor) => {
		// TODO: точно ли нужно добавление цвтета в историю? В useHistory проверка по отображаемому цвету
		addHistoryAction(pin)
	}

	return (
		<div
			className={styles.pin}
			style={{
				backgroundColor: convertColor(pin, color.format).displayed,
			}}
			onClick={() => clickHandler(pin)}>
			<div
				className={styles.cover}
				style={{
					backgroundColor: convertColor(pin, color.format).displayed,
					opacity: 1 - pin.alpha / 100,
				}}></div>
		</div>
	)
}
