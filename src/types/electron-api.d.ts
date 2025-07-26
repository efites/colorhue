export { }

declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void
      closeWindow: () => void
      resizeWindow: (width: number, height: number) => void
    }
  }
}
