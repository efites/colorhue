import clsx from 'clsx'
import Icon from '../Icon/Icon'
import styles from './Main.module.scss'
import {useColorForm} from '@/app/hooks/useColorForm'
import {Visualizer} from '../Visualizer/Visualizer'
import {HarmonyButtons} from '../HarmonyButtons/HarmonyButtons'
import {IColor} from '@/types/picker'

export const Main = () => {
	const {state, actions} = useColorForm()

	return (
		<div className={styles.main}>
			<Visualizer image={state.image} />

			<div className={clsx(styles.settings, state.mode === 'gradient' && styles.solid)}>
				<div className={styles.indication}>
					<div className={styles.gamma}>
						<button
							className={styles.pipette}
							type='button'
							onClick={actions.pickColor}>
							<Icon
								className={clsx(styles.pipetteIcon, styles.active)}
								name='pipette'
							/>
						</button>
						<div className={styles.sliders}>
							<div className={clsx(styles.slider, styles.rainbow)}></div>
							<div className={clsx(styles.slider, styles.rgba)}></div>
						</div>
					</div>

					{state.mode === 'solid' && (
						<div className={styles.inputs}>
							<div className={styles.model}>
								<select className={styles.select}>
									{(['hex', 'rgb'] as IColor['format'][]).map(format => {
										return <option value={format}>{format}</option>
									})}
								</select>
								<Icon className={styles.arrow} name='arrow-down' />
							</div>
							<div className={styles.codes}>
								<div className={styles.codeWrapper}>
									<input
										className={styles.code}
										type='text'
										value={state.code.toUpperCase()}
										onChange={actions.handleCodeChange}
										onBlur={actions.handleCodeBlur}
									/>
								</div>
								<div className={styles.percentages}>
									<input
										className={styles.opacity}
										maxLength={3}
										type='number'
										value={state.opacity}
										onChange={actions.handleOpacityChange}
										onBlur={actions.handleOpacityBlur}
									/>
									<span className={styles.static}>%</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{state.mode === 'solid' && <HarmonyButtons />}
			</div>
		</div>
	)
}
