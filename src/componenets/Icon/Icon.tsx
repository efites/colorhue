import React from 'react'
import {clsx} from 'clsx';
import styles from './Icon.module.scss'
import {Mode} from 'src/app/contexts/Global'


interface IProps {
	name: Mode | 'pipette' | 'arrow-down' | 'combination-6' | 'combination-5' | 'combination-4' | 'combination-3' | 'combination-2' | 'combination-1'
	className?: string
}

const path = '/src/shared/images/sprite.svg'

function Icon({name, className = ''}: IProps) {
	return <svg className={clsx(styles.base, styles[name], !!className && className)}>
		<use href={path + '#' + name}></use>
	</svg>
}

export default Icon;
