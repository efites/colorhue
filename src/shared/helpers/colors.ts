import {IColor} from '@/types/picker'
import {RegularsExp} from '../consts/regexp'

type RGB = {r: number; g: number; b: number}

interface IPull extends Omit<IColor, 'alpha'> {
	shades: Omit<IColor, 'alpha'>[]
}

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

export const parseHex = (hex: string): RGB | null => {
	const cleanHex = hex.replace('#', '').trim()

	if (cleanHex.length === 3) {
		// #f00 -> #ff0000
		const r = parseInt(cleanHex[0] + cleanHex[0], 16)
		const g = parseInt(cleanHex[1] + cleanHex[1], 16)
		const b = parseInt(cleanHex[2] + cleanHex[2], 16)

		return {r, g, b}
	} else if (cleanHex.length === 6) {
		const r = parseInt(cleanHex.substring(0, 2), 16)
		const g = parseInt(cleanHex.substring(2, 4), 16)
		const b = parseInt(cleanHex.substring(4, 6), 16)

		return {r, g, b}
	}

	return null
}

export const parseRgb = (rgb: string): RGB | null => {
	const match = rgb.match(/\d+/g) // get numbers

	if (match && match.length >= 3) {
		return {
			r: Math.min(255, Math.max(0, parseInt(match[0]))),
			g: Math.min(255, Math.max(0, parseInt(match[1]))),
			b: Math.min(255, Math.max(0, parseInt(match[2]))),
		}
	}

	return null
}

export const rgbToHex = ({r, g, b}: RGB): string => {
	const toHex = (n: number) => {
		const hex = n.toString(16)

		return hex.length === 1 ? '0' + hex : hex
	}

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export const rgbToString = ({r, g, b}: RGB): string => {
	return `${r}, ${g}, ${b}`
}

export const convertColor = (
	color: IColor,
	to: IColor['format'],
): IColor => {
	if (color.format === to) return color

	let rgb: RGB | null = null

	switch (color.format) {
		case 'hex':
			rgb = parseHex(color.displayed)
			break
		case 'rgb':
			rgb = parseRgb(color.displayed)
			break
	}

	if (!rgb) return color

	switch (to) {
		case 'hex':
			return {...color, format: 'hex', displayed: rgbToHex(rgb)}
		case 'rgb':
			return {...color, format: 'rgb', displayed: rgbToString(rgb)}
		default:
			return color
	}
}

export const getCssColor = (color: string, format: string, alpha: number): string => {
	if (format === 'rgb') {
		// color = "rgb(255, 0, 0)" -> "rgba(255, 0, 0, 1)"
		return color.replace('rgb', 'rgba').replace(')', `, ${alpha / 100})`)
	}

	if (format === 'hex') {
		// Самый надежный способ для веба сейчас: конвертация в rgba
		// Но можно использовать и hex8, если поддерживается
		// Для простоты, если у вас уже есть rgb конвертер, используйте его,
		// или просто верните color и добавьте CSS свойство opacity в стилях элемента.

		// Вариант с HEX c прозрачностью (#RRGGBBAA):
		const alphaHex = Math.round(alpha * 2.55)
			.toString(16)
			.padStart(2, '0')

		return `${color}${alphaHex}`
	}

	return color
}

export const findPullColors = (color: IColor) => {
	const result: IPull[] = [
		{
			displayed: color.displayed,
			base: color.displayed,
			format: 'hex',
			luminance: color.luminance,
			shades: [
				{
					displayed: '#1a9230ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#024d0fff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#40774aff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#57775dff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
			],
		},
		{
			displayed: '#a40e09ff',
			base: '#a40e09ff',
			format: 'hex',
			luminance: color.luminance,
			shades: [
				{
					displayed: '#670d0aff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#c63631ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#f45650ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#5b0b08ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
			],
		},
		{
			displayed: '#05276bff',
			base: '#05276bff',
			format: 'hex',
			luminance: color.luminance,
			shades: [
				{
					displayed: '#061a43ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#0b46bbff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#2f63ccff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#89aef7ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
			],
		},
		{
			displayed: '#c0ba17ff',
			base: '#c0ba17ff',
			format: 'hex',
			luminance: color.luminance,
			shades: [
				{
					displayed: '#e5e04aff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#949010ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#646104ff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
				{
					displayed: '#fffcacff',
					base: color.base,
					luminance: color.luminance,
					format: 'hex',
				},
			],
		},
	]

	return result
}
