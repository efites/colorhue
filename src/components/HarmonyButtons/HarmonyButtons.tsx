import clsx from 'clsx'
import Icon from '../Icon/Icon'
import styles from './HarmonyButtons.module.scss'
import {useContext} from 'react'
import {GlobalContext, Harmony} from '../../app/contexts/Global'

const harmonies: Harmony[] = [
	'monochrome',
	'complementary',
	'analog',
	'triad',
	'analog-complementary',
	'tetrad',
] as const

export const HarmonyButtons = () => {
	const {harmony, setHarmony} = useContext(GlobalContext)

	return (
		<div className={styles.triads}>
			<div className={styles.titles}>
				<h2 className={styles.title}>{harmony.toLowerCase()}</h2>
			</div>
			<div className={styles.combinations}>
				{harmonies.map(scheme => (
					<button
						key={scheme}
						className={clsx(styles.combination, scheme === harmony && styles.active)}
						type='button'
						onClick={() => setHarmony(scheme)}>
						<Icon className={styles.combinationIcon} name={scheme} />
					</button>
				))}
			</div>
		</div>
	)
}
