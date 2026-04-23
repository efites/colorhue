import {atom} from '@reatom/core'
import {Mode} from './global'

export const modeAtom = atom<Mode>('solid', 'modeAtom')
