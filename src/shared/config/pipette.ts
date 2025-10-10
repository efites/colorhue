import configJson from '../../../config.json' assert { type: 'json' }

type AppConfig = {
  buildMode: 'dev' | 'prod'
  pipette: {
    minSize: number
    maxSize: number
    step: number
    defaultSize: number
  }
  overlayDevSize?: { width: number; height: number }
}

const cfg = configJson as AppConfig

export const pipetteConfig = {
  minSize: cfg.pipette.minSize,
  maxSize: cfg.pipette.maxSize,
  step: cfg.pipette.step,
  defaultSize: cfg.pipette.defaultSize,
}

export const buildMode = cfg.buildMode
export const overlayDevSize = cfg.overlayDevSize
