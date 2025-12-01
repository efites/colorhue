import {useContext} from 'react'
import {Pin} from '..'
import styles from './History.module.scss'
import {GlobalContext} from '../../app/contexts/Global'
import {IColor} from '@/types/picker'
import {convertColor} from '@/shared/helpers/colors'

export const History = () => {
	const {history, setColor, color: globalColor} = useContext(GlobalContext)

	const chooseColorPin = (
		code: IColor['color'],
		format: IColor['format'],
		alpha: IColor['alpha'],
	) => {
		const convertedCode = convertColor(code, format, globalColor.format)

		setColor({color: convertedCode, format: globalColor.format, alpha})
	}

	return (
		<div className={styles.history}>
			<div className={styles.pins}>
				{history.map(({color, format, alpha}) => {
					return (
						<div
							key={`${color}-${alpha}`}
							onClick={() => chooseColorPin(color, format, alpha)}>
							<Pin color={color} format={format} alpha={alpha} />
						</div>
					)
				})}
			</div>
		</div>
	)
}
