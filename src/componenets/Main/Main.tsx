import React from 'react'
import styles from './Main.module.scss'
import clsx from 'clsx'
import Icon from '../Icon/Icon'


export const Main = () => {

	return <div className={styles.main}>
		<div className={styles.selection}>
			<div className={styles.circle}></div>
			<div className={styles.windows}>
				<div className={clsx(styles.window, styles.screenshot)}></div>
				<div className={clsx(styles.window, styles.brightness)}></div>
			</div>
		</div>
		<div className={styles.settings}>
			<div className={styles.indication}>
				<div className={styles.gamma}>
					<button className={styles.pipette}>
						<Icon name='pipette' className={clsx(styles.pipetteIcon, styles.active)} />
					</button>
					<div className={styles.sliders}>
						<div className={clsx(styles.slider, styles.rainbow)}></div>
						<div className={clsx(styles.slider, styles.rgba)}></div>
					</div>
				</div>
				<div className={styles.inputs}>
					<div className={styles.model}>
						<select className={styles.select}>
							<option value="HEX">HEX</option>
							<option value="RGB">RGB</option>
						</select>
						<Icon name='arrow-down' className={styles.arrow}/>
					</div>
					<div className={styles.codes}>
						<div className={styles.codeWrapper}>
							<input type="text" className={styles.code} />
						</div>
						<div className={styles.percentages}>
							<input type="text" maxLength={3} className={styles.opacity} />
							<span className={styles.static}>%</span>
						</div>
					</div>
				</div>
			</div>
			<div className={styles.triads}>
				<div className={styles.titles}>
					<h2 className={styles.title}>Monochromatic</h2>
				</div>
				<div className={styles.combinations}>
					<button className={styles.combination}>
						<Icon name='combination-1' className={styles.combinationIcon} />
					</button>
					<button className={styles.combination}>
						<Icon name='combination-2' className={styles.combinationIcon} />
					</button>
					<button className={styles.combination}>
						<Icon name='combination-3' className={styles.combinationIcon} />
					</button>
					<button className={styles.combination}>
						<Icon name='combination-4' className={styles.combinationIcon} />
					</button>
					<button className={styles.combination}>
						<Icon name='combination-5' className={styles.combinationIcon} />
					</button>
					<button className={styles.combination}>
						<Icon name='combination-6' className={styles.combinationIcon} />
					</button>
				</div>
			</div>
		</div>
	</div>
}
