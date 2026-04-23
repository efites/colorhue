import {useAtom} from '@reatom/react'
import styles from './Сompilation.module.scss'
import {findPullColors} from '@/shared/helpers/colors'
import {colorAtom, IColor} from '@/model/color'

export const Сompilation = () => {
	const [color] = useAtom(colorAtom)
	const pulls = findPullColors(color)

	const clickToCopy = async (color: Omit<IColor, 'alpha'>) => {
		const after = color.displayed

		await navigator.clipboard.writeText(after)
		alert('Скопировано: ' + after)
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
