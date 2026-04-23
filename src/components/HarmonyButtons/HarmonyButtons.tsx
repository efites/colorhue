import clsx from 'clsx'
import Icon from '../Icon/Icon'
import styles from './HarmonyButtons.module.scss'
import {useAtom} from '@reatom/react'
import {harmonyAtom} from '@/app/model/harmony'
import {Harmony} from '@/app/model/global.types'

const harmonies: Harmony[] = [
	'monochrome',
	'complementary',
	'analog',
	'triad',
	'analog-complementary',
	'tetrad',
] as const

export const HarmonyButtons = () => {
	const [harmony, setHarmony] = useAtom(harmonyAtom)

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
