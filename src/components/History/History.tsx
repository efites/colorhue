import {useAtom} from '@reatom/react'
import {Pin} from '..'
import styles from './History.module.scss'
import {convertColor} from '@/shared/helpers/colors'
import {historyAtom} from '@/model/history'
import {colorAtom, IColor} from '@/app/model/color'

export const History = () => {
	const [history] = useAtom(historyAtom)
	const [globalColor, setColor] = useAtom(colorAtom)

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
