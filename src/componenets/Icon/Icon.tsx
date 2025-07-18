import React from 'react'
import {clsx} from 'clsx';
import styles from './Icon.module.scss'
import {Mode} from 'src/app/contexts/Global'


interface IProps {
	name: Mode
	className?: string
}

const path = '/src/shared/images/sprite.svg'

function Icon({name, className = ''}: IProps) {
	return <svg className={clsx(styles.base, styles[name], !!className && className)}>
		<use href={path + '#' + name}></use>
	</svg>
}

export default Icon;
