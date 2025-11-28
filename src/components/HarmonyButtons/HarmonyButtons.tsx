import clsx from 'clsx'
import Icon from '../Icon/Icon'
import styles from './HarmonyButtons.module.scss'


export const HarmonyButtons = () => (
	<div className={styles.triads}>
		<div className={styles.titles}>
			<h2 className={styles.title}>Monochromatic</h2>
		</div>
		<div className={styles.combinations}>
			{/* Можно даже мапом пройтись, если иконок много */}
			{[1, 2, 3, 4, 5, 6].map((num, i) => (
				<button
					key={num}
					className={clsx(styles.combination, i === 1 && styles.active)}
					type='button'
				>
					<Icon className={styles.combinationIcon} name={`combination-${num}`} />
				</button>
			))}
		</div>
	</div>
)
