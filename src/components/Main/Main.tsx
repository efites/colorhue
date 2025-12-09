import clsx from 'clsx'
import Icon from '../Icon/Icon'
import styles from './Main.module.scss'
import {useColorForm} from '@/app/hooks/useColorForm'
import {Visualizer} from '../Visualizer/Visualizer'
import {HarmonyButtons} from '../HarmonyButtons/HarmonyButtons'
import {Select} from '../Select/Select'
import {IColor} from '@/types/picker'
import {convertColor} from '@/shared/helpers/colors'

const formats: IColor['format'][] = ['hex', 'rgb'] as const

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
							<div className={clsx(styles.slider, styles.rainbow)}>
								<div className={styles.opacityPin} style={{right: '0%'}}></div>
							</div>
							<div className={clsx(styles.slider, styles.rgba)}>
								<div
									className={clsx(styles.cover)}
									style={{
										background: `linear-gradient(90deg, rgba(${convertColor(state.code, state.format, 'rgb')}, 0) 0%, ${state.code})`,
									}}>
								</div>
								<div className={styles.opacityPin} style={{right: '0%'}}></div>
							</div>
						</div>
					</div>
					{state.mode === 'solid' && (
						<div className={styles.inputs}>
							<Select
								placeholder='Формат'
								// Формируем объект Option для Select из стейта
								selected={{label: state.format, value: state.format}}
								options={formats.map(format => ({label: format, value: format}))}
								// Передаем значение (value) в экшн хука
								onChange={option =>
									actions.handleFormatChange(option.value as IColor['format'])
								}
								icon='arrow-down'
							/>
							<div className={styles.codes}>
								<div className={styles.codeWrapper}>
									<input
										className={styles.code}
										type='text'
										value={state.code.toUpperCase()}
										onChange={actions.handleCodeChange}
										onBlur={actions.handleCodeBlur}
										onKeyDown={actions.onKeyDown}
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
										onKeyDown={actions.onKeyDown}
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
