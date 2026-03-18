import {useContext} from 'react'
import {Pin} from '..'
import styles from './History.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {IColor} from '@/types/picker'
import {convertColor} from '@/shared/helpers/colors'

export const History = () => {
	const {history, setColor, color: globalColor} = useContext(GlobalContext)

	const chooseColorPin = (color: IColor) => {
		const result = convertColor(color, globalColor.format)

		if (
			result.displayed === globalColor.displayed &&
			result.alpha === globalColor.alpha &&
			result.base === globalColor.base
		)
			return

		setColor(result)
	}

	return (
		<div className={styles.history}>
			<div className={styles.pins}>
				{history.map((color, index) => {
					return (
						<div
							key={`${color.displayed}-${color.alpha}-${index}`}
							onClick={() => chooseColorPin(color)}>
							<Pin pin={color} />
						</div>
					)
				})}
			</div>
		</div>
	)
}
