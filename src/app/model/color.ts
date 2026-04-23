import {atom} from '@reatom/core'
import {IColor} from '@/types/picker'
import {readHistoryFromStorage} from './history'

export const initialColor: IColor = {
	base: '#ffffff',
	displayed: '#ffffff',
	format: 'hex',
	alpha: 100,
	luminance: {tint: 0, shade: 0},
}

const getInitialColor = () => readHistoryFromStorage().at(0) ?? initialColor

export const colorAtom = atom<IColor>(getInitialColor(), 'colorAtom')
