import clsx from 'clsx'
import Icon from '../Icon/Icon'
import styles from './Main.module.scss'
import {useColorForm} from '@/app/hooks/useColorForm'
import {Visualizer} from '../Visualizer/Visualizer'
import {HarmonyButtons} from '../HarmonyButtons/HarmonyButtons'
import {Select} from '../Select/Select'
import {IColor} from '@/types/picker'
import {useContext} from 'react'
import {GlobalContext} from '../../app/contexts/Global'
// import {convertColor} from '@/shared/helpers/colors'

const formats: IColor['format'][] = ['hex', 'rgb'] as const

export const Main = () => {
	const {mode} = useContext(GlobalContext)
	const {state, actions} = useColorForm()

	// Вспомогательная функция для CSS градиента (прозрачность -> цвет)
	// Важно: convertColor должен уметь возвращать строку rgb для CSS
	// const rgbString = convertColor(state.code, 'rgb').displayed

	return (
		<div className={styles.main}>
			<Visualizer image={state.image} />

			<div className={clsx(styles.settings, mode === 'gradient' && styles.solid)}>
				<div className={styles.indication}>
					<div className={styles.gamma}>
						<button className={styles.pipette} type='button' onClick={actions.pickColor}>
							<Icon className={clsx(styles.pipetteIcon, styles.active)} name='pipette' />
						</button>

						<div className={styles.sliders}>
							<div className={clsx(styles.slider, styles.rainbow)}>
								<div className={styles.opacityPin} style={{left: '50%'}} /> {/* Логика позиции пина */}
							</div>
							<div className={clsx(styles.slider, styles.rgba)}>
								<div
									className={styles.cover}
									style={{
										// Делаем градиент от прозрачного к текущему цвету
										background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${state.color.base})`,
									}}
								/>
								<div
									className={styles.opacityPin}
									style={{left: `${state.color.alpha}%`}} // Пин двигается за процентами
								/>
							</div>
						</div>
					</div>

					{mode === 'solid' && (
						<div className={styles.inputs}>
							<Select
								placeholder='Формат'
								selected={{label: state.color.format.toUpperCase(), value: state.color.format}}
								options={formats.map(f => ({label: f.toUpperCase(), value: f}))}
								onChange={_ => { }}
								icon='arrow-down'
							/>
							<div className={styles.codes}>
								<div className={styles.codeWrapper}>
									<input
										className={styles.code}
										type='text'
										value={state.color.displayed.toUpperCase()}
										onChange={actions.handleCodeChange}
										onBlur={actions.handleCodeBlur}
										onKeyDown={actions.onKeyDown}
									/>
								</div>
								<div className={styles.percentages}>
									<input
										className={styles.opacity}
										type='number'
										value={state.color.alpha}
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
				{mode === 'solid' && <HarmonyButtons />}
			</div>
		</div>
	)
}
