import {clsx} from 'clsx'

import type {Harmony, Mode} from '../../app/contexts/Global'

import styles from './Icon.module.scss'

export interface IconProps {
	className?: string
	name:
		| 'arrow-down'
		| 'clipboard'
		| 'close'
		| 'minus'
		| 'pipette'
		| 'plus'
		| 'sync'
		| Mode
		| Harmony
}

const path = '/src/shared/images/sprite.svg'

const Icon = ({name, className = ''}: IconProps) => {
	return (
		<svg className={clsx(styles.base, styles[name], !!className && className)}>
			<use href={`${path}#${name}`}></use>
		</svg>
	)
}

export default Icon
