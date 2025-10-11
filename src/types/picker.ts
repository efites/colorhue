export interface PipetteCapture {
	image: string
	color: string
	format: 'hex' | 'rgb'
}

export interface CursorPosition {
	x: number
	y: number
	size?: number
	format?: string
}
