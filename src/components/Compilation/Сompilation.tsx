import styles from './Сompilation.module.scss'


export const Сompilation = () => {
	return (
		<div className={styles.сompilation}>
			{Array.from({length: 4}).map((_, index) => {
				return (
					<div key={index} className={styles.set}>
						<div className={styles.cube}></div>
						<div className={styles.rects}>
							{Array.from({length: 4}).map((_, index) => {
								return <div key={index} className={styles.rect}></div>
							})}
						</div>
					</div>
				)
			})}
		</div>
	)
}
