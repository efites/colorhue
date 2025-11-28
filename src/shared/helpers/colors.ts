import {IColor} from '@/types/picker'
import {RegularsExp} from '../consts/regexp'

export const expandHex = (value: string): string => {
	switch (value.length) {
		case 1:
			return value.repeat(6) // "1" -> "111111"
		case 2:
			return value.repeat(3) // "12" -> "121212"
		case 3: // "123" -> "112233"
		case 4: // "1234" -> "112233"
		case 5: // "12345" -> "112233"
			return value
				.substring(0, 3)
				.split('')
				.map(char => char + char)
				.join('')
		default:
			return value
	}
}

export const validateAndFormatColor = (input: string, format: IColor['format']) => {
	const value = input.trim()

	switch (format) {
		case 'hex':
			// Remove '#' and cut: #123456
			const cleanHex = value.replace(/^#/, '').slice(0, 6)

			// Full HEX
			if (RegularsExp.hex.test(cleanHex)) {
				return `#${cleanHex}`
			}

			// Short HEX
			if (RegularsExp.shortHex.test(cleanHex)) {
				const expanded = expandHex(cleanHex)

				if (RegularsExp.hex.test(expanded)) {
					return `#${expanded}`
				}
			}

			break
		case 'rgb':
			// Remove ' ' and cut: rgb(255,255,255,0.99)
			const cleanRGB = value.replaceAll(' ', '').slice(0, 21)

			if (RegularsExp.rgb.test(cleanRGB)) {
				return cleanRGB
			}

			break
		default:
			return null
	}

	return null
}
