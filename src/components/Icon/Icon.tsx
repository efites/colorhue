import {clsx} from 'clsx'

import type {Mode} from '../../app/contexts/Global'

import styles from './Icon.module.scss'

interface IProps {
	className?: string
	name:
		| 'arrow-down'
		| 'clipboard'
		| 'close'
		| 'combination-1'
		| 'combination-2'
		| 'combination-3'
		| 'combination-4'
		| 'combination-5'
		| 'combination-6'
		| 'minus'
		| 'pipette'
		| 'plus'
		| 'sync'
		| Mode
}

const path = '/src/renderer/shared/images/sprite.svg'

const Icon = ({name, className = ''}: IProps) => {
	return (
		<svg className={clsx(styles.base, styles[name], !!className && className)}>
			<use href={`${path}#${name}`}></use>
		</svg>
	)
}

export default Icon
