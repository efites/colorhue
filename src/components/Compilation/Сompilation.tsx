import {useContext} from 'react'
import styles from './Сompilation.module.scss'
import {GlobalContext} from '@/app/contexts/Global'
import {findPullColors} from '@/shared/helpers/colors'
import {IColor} from '@/types/picker'

export const Сompilation = () => {
	const {color} = useContext(GlobalContext)
	const pulls = findPullColors(color)

	const clickToCopy = async (color: Omit<IColor, 'alpha'>) => {
		color.displayed

		// await navigator.clipboard.writeText(after)
		// alert('Скопировано: ' + after)
	}

	return (
		<div className={styles.сompilation}>
			{pulls.map((pull, index) => {
				return (
					<div key={pull.displayed + index} className={styles.set}>
						<div
							className={styles.cube}
							style={{backgroundColor: pull.displayed}}
							onClick={() => clickToCopy(pull)}></div>
						<div className={styles.rects}>
							{pull.shades.map((shade, index) => {
								return (
									<div
										key={shade.displayed + index}
										className={styles.rect}
										style={{backgroundColor: shade.displayed}}
										onClick={() => clickToCopy(shade)}></div>
								)
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}
