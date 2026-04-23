import {atom} from '@reatom/core'
import {Mode} from './global.types'

export const modeAtom = atom<Mode>('solid', 'modeAtom')
