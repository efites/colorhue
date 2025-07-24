import clsx from 'clsx'
import React from 'react'

import Icon from '../Icon/Icon'

import styles from './Rainbow.module.scss'


export const Rainbow = ({}: IProps) => {

	return <div className={styles.rainbow}>
		<div className={styles.panel}>
			<div className={styles.model}>
				<select className={styles.select}>
					<option value='Diamond'>Diamond</option>
					<option value='Plastic'>Plastic</option>
				</select>
				<Icon className={styles.arrow} name='arrow-down' />
			</div>
			<div className={styles.rotation}>
				<Icon className={styles.rotateIcon} name='sync' />
				<input className={styles.degrees} type="text" value={'359^'} />
			</div>
		</div>
		<div className={styles.line}>
			<div className={clsx(styles.picker, styles.active)}>
				<div className={styles.cube}>
					<div className={styles.color}></div>
				</div>
				<div className={styles.triangle}></div>
			</div>
		</div>
		<div className={styles.management}>
			<div className={styles.headline}>
				<h4 className={styles.title}>Stops</h4>
				<button className={styles.plus} type='button'>
					<Icon className={styles.plusIcon} name={'plus'} />
				</button>
			</div>
			<div className={styles.stops}>
				{Array.from({length: 4}).map((_, index) => {
					return <div key={index} className={styles.stop}>
					<div className={styles.stopColor}></div>
					<div className={styles.position}>
						<input className={styles.offset} maxLength={3} type='text' />
						<span className={styles.static}>%</span>
					</div>
					<div className={clsx(styles.model, styles.modelMargin)}>
						<select className={styles.select}>
							<option value='HEX'>HEX</option>
							<option value='RGB'>RGB</option>
						</select>
						<Icon className={styles.arrow} name='arrow-down' />
					</div>
					<div className={styles.codeWrapper}>
						<input className={styles.code} type='text' />
					</div>
					<div className={styles.percentages}>
						<input className={styles.opacity} maxLength={3} type='text' />
						<span className={styles.static}>%</span>
					</div>
					<button className={styles.minus} type='button'>
						<Icon className={styles.minusIcon} name={'minus'} />
					</button>
				</div>
				})}
			</div>
			<div className={styles.language}>
				<code className={styles.codeData}>padding: 5px 8px 5px 20px;</code>
				<button className={styles.copyCode} type='button'>
					<Icon className={styles.copyCodeIcon} name='minus' />
				</button>
			</div>
		</div>
	</div>
}
