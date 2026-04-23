import {atom} from '@reatom/core'
import {readHistoryFromStorage} from './history'

export interface IColor {
	base: string
	displayed: string
	format: 'hex' | 'rgb'
	alpha: number
	luminance: {
		tint: number
		shade: number
	}
}

export const initialColor: IColor = {
	base: '#ffffff',
	displayed: '#ffffff',
	format: 'hex',
	alpha: 100,
	luminance: {tint: 0, shade: 0},
}

const getInitialColor = () => readHistoryFromStorage().at(0) ?? initialColor

export const colorAtom = atom<IColor>(getInitialColor(), 'colorAtom')
