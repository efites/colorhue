import {IColor} from '@/types/picker'
import {RegularsExp} from '../consts/regexp'

type RGB = {
	r: number
	g: number
	b: number
}

interface IPull extends IColor {
	shades: IColor[]
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

interface IValidateColor {
	format: IColor['format']
	code: IColor['displayed']
}

export const validateColor = (input: string): IValidateColor | null => {
	const value = input.trim()
	const hex = isHexCode(value)
	const rgb = isRGBCode(value)

	if (hex) {
		return {format: 'hex', code: hex}
	}

	if (rgb) {
		return {format: 'rgb', code: rgb}
	}

	return null
}

const isHexCode = (input: string): IColor['displayed'] | null => {
	// Remove '#' and cut: #123456
	const cleanHex = input.replace(/^#/, '').slice(0, 6)

	// Full HEX
	if (RegularsExp.hex.test(cleanHex)) {
		return `#${cleanHex}`
	}

	// Short HEX
	if (RegularsExp.shortHex.test(cleanHex)) {
		const expanded = expandHex(cleanHex)

		if (RegularsExp.hex.test(expanded)) {
			return `#${cleanHex}`
		}
	}

	return null
}

const isRGBCode = (input: string): IColor['displayed'] | null => {
	// Remove ' ' and cut: rgb(255,255,255,0.99)
	const cleanRGB = input.replaceAll(' ', '').slice(0, 21)

	if (RegularsExp.rgb.test(cleanRGB)) {
		return cleanRGB
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
	return `rgb(${r}, ${g}, ${b})`
}

export const convertColor = (color: IColor, to: IColor['format']): IColor => {
	if (color.format === to) return color

	let rgbBase: RGB | null = null
	let rgbDisplayed: RGB | null = null

	switch (color.format) {
		case 'hex':
			rgbBase = parseHex(color.base)
			rgbDisplayed = parseHex(color.displayed)
			break
		case 'rgb':
			rgbBase = parseRgb(color.base)
			rgbDisplayed = parseRgb(color.displayed)
			break
	}

	if (!rgbDisplayed || !rgbBase) return color

	switch (to) {
		case 'hex':
			return {
				...color,
				format: 'hex',
				displayed: rgbToHex(rgbDisplayed),
				base: rgbToHex(rgbBase),
			}
		case 'rgb':
			return {
				...color,
				format: 'rgb',
				displayed: rgbToString(rgbDisplayed),
				base: rgbToString(rgbBase),
			}
		default:
			throw new Error('saddas')
	}
}

export const findPullColors = (color: IColor) => {
	const pull = convertColor(color, 'hex')

	const compilations: IColor[] = Array.from({length: 3}).map(() => {
		return {
			displayed: generateSmartHarmoniousColor(pull.displayed),
			base: generateSmartHarmoniousColor(pull.displayed),
			alpha: 100,
			format: 'hex',
			luminance: {
				shade: 0,
				tint: 0,
			},
		}
	})

	compilations.unshift(pull)

	const result: IPull[] = compilations.map(compilation => ({
		...compilation,
		shades: Array.from({length: 4}).map(() => {
			return {
				base: compilation.base,
				displayed: randomTint(compilation.displayed),
				format: 'hex',
				alpha: 0,
				luminance: compilation.luminance,
			}
		}),
	}))

	return result
}

function randomTint(hexColor: string): string {
	// Удаляем символ # если есть
	const hex = hexColor.replace(/^#/, '')

	// Проверяем валидность hex цвета
	if (!/^[0-9A-Fa-f]{6}$/.test(hex) && !/^[0-9A-Fa-f]{3}$/.test(hex)) {
		throw new Error('Неверный формат HEX цвета. Ожидается #123456 или #123')
	}

	// Конвертируем 3-символьный формат в 6-символьный
	const fullHex =
		hex.length === 3
			? hex
					.split('')
					.map(c => c + c)
					.join('')
			: hex

	// Парсим цветовые компоненты
	const r = parseInt(fullHex.substring(0, 2), 16)
	const g = parseInt(fullHex.substring(2, 4), 16)
	const b = parseInt(fullHex.substring(4, 6), 16)

	// Преобразуем RGB в HSL для удобной манипуляции
	const hsl = rgbToHsl(r, g, b)

	// Генерируем случайные изменения для светлоты и насыщенности
	// Случайное значение от -0.2 до 0.2 для светлоты (делаем темнее/светлее)
	const lightnessChange = Math.random() * 0.4 - 0.2

	// Случайное значение от -0.2 до 0.2 для насыщенности
	const saturationChange = Math.random() * 0.4 - 0.2

	// Применяем изменения, ограничивая значения от 0 до 1
	hsl.l = Math.max(0, Math.min(1, hsl.l + lightnessChange))
	hsl.s = Math.max(0, Math.min(1, hsl.s + saturationChange))

	// Конвертируем обратно в RGB
	const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l)

	// Конвертируем обратно в HEX
	return rgbToHex({r: newRgb.r, g: newRgb.g, b: newRgb.b})
}

function rgbToHsl(r: number, g: number, b: number): {h: number; s: number; l: number} {
	r /= 255
	g /= 255
	b /= 255

	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	let h = 0,
		s = 0,
		l = (max + min) / 2

	if (max !== min) {
		const d = max - min
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / d + 2
				break
			case b:
				h = (r - g) / d + 4
				break
		}

		h /= 6
	}

	return {h, s, l}
}

function hslToRgb(h: number, s: number, l: number): {r: number; g: number; b: number} {
	let r: number, g: number, b: number

	if (s === 0) {
		r = g = b = l // achromatic
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1
			if (t > 1) t -= 1
			if (t < 1 / 6) return p + (q - p) * 6 * t
			if (t < 1 / 2) return q
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
			return p
		}

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s
		const p = 2 * l - q

		r = hue2rgb(p, q, h + 1 / 3)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h - 1 / 3)
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	}
}

function generateSmartHarmoniousColor(hexColor: string): string {
	return hexColor
}

export function getHueOffset(color: IColor): number | null {
	const rgbBase = color.format === 'rgb' ? parseRgb(color.base) : parseHex(color.base)

	if (!rgbBase) return null

	const {r, g, b} = rgbBase
	const max = Math.max(r, g, b)
	const min = Math.min(r, g, b)
	const delta = max - min

	let h = 0

	if (delta === 0) {
		h = 0
	} else {
		switch (max) {
			case r:
				h = (g - b) / delta + (g < b ? 6 : 0)
				break
			case g:
				h = (b - r) / delta + 2
				break
			case b:
				h = (r - g) / delta + 4
				break
		}
		h /= 6
	}

	return Math.round(h * 100)
}

export const getColorByHueOffset = (offset: number): string => {
	// HSL
	const h = (offset / 100) * 360
	const s = 1
	const l = 0.5

	const c = (1 - Math.abs(2 * l - 1)) * s
	const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
	const m = l - c / 2

	let rVal = 0,
		gVal = 0,
		bVal = 0

	if (0 <= h && h < 60) {
		rVal = c
		gVal = x
		bVal = 0
	} else if (60 <= h && h < 120) {
		rVal = x
		gVal = c
		bVal = 0
	} else if (120 <= h && h < 180) {
		rVal = 0
		gVal = c
		bVal = x
	} else if (180 <= h && h < 240) {
		rVal = 0
		gVal = x
		bVal = c
	} else if (240 <= h && h < 300) {
		rVal = x
		gVal = 0
		bVal = c
	} else if (300 <= h && h <= 360) {
		rVal = c
		gVal = 0
		bVal = x
	}

	const format = (val: number) => Math.round((val + m) * 255)

	return rgbToHex({r: format(rVal), g: format(gVal), b: format(bVal)})
}
