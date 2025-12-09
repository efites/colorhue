import {useContext} from 'react'
import styles from './Сompilation.module.scss'
import {GlobalContext} from '@/app/contexts/Global'
import {findPullColors} from '@/shared/helpers/colors'
import {IColor} from '@/types/picker'

export const Сompilation = () => {
	const {color} = useContext(GlobalContext)
	const pulls = findPullColors(color)

	const clickToCopy = async (color: Omit<IColor, 'alpha'>) => {
		const after = color.color

		switch (color.format) {
			case 'hex':
				await navigator.clipboard.writeText(after)
				alert('Скопировано: ' + after)
				break
			case 'rgb':
				await navigator.clipboard.writeText(after)
				alert('Скопировано: ' + after)
				break
			default:
				break
		}
	}

	return (
		<div className={styles.сompilation}>
			{pulls.map((pull, index) => {
				return (
					<div key={pull.color + index} className={styles.set}>
						<div className={styles.cube} style={{backgroundColor: pull.color}} onClick={() => clickToCopy(pull)}></div>
						<div className={styles.rects}>
							{pull.shades.map((shade, index) => {
								return <div key={shade.color + index} className={styles.rect} style={{backgroundColor: shade.color}} onClick={() => clickToCopy(shade)}></div>
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}
