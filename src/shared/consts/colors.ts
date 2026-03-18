import {IColor} from '../../types/picker'

export const Colors = {
	bg: '#d0d0d0',
	grey: '#393939',
} as const

export const History_Settings = {
	max_colors: 26,
} as const

export const FORMATS: IColor['format'][] = ['hex', 'rgb'] as const
