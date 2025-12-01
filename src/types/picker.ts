export interface IColor {
	color: string
	format: 'hex' | 'rgb'
	alpha: number
}

export interface PipetteCapture extends IColor {
	image: string
}

export interface CursorPosition {
	x: number
	y: number
	size?: number
	format?: string
}
