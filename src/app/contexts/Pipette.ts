import {createContext} from 'react'
import {useColorPicker} from '../hooks/useColorPicker'
import {initialColor} from '@/app/model/color'
import ScreenFallback from '../../shared/images/screen.png'

const initialPipetteContext: ReturnType<typeof useColorPicker> = {
	pickedColor: initialColor,
	image: ScreenFallback,
	pickColor: async () => {},
}

const PipetteContext = createContext<ReturnType<typeof useColorPicker>>(initialPipetteContext)

export {PipetteContext, initialPipetteContext}
