import type {Mode} from 'src/app/contexts/Global'

import {clsx} from 'clsx'
import React from 'react'

import styles from './Icon.module.scss'

interface IProps {
	className?: string
	name:
		| 'arrow-down'
		| 'combination-1'
		| 'combination-2'
		| 'combination-3'
		| 'combination-4'
		| 'combination-5'
		| 'combination-6'
		| 'pipette'
		| Mode
}

const path = '/src/shared/images/sprite.svg'

const Icon = ({name, className = ''}: IProps) => {
	return (
		<svg className={clsx(styles.base, styles[name], !!className && className)}>
			<use href={`${path  }#${  name}`}></use>
		</svg>
	)
}

export default Icon
