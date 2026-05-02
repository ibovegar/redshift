import { useCallback, useRef, useState } from 'react'

interface ExpandAnimationState {
  isOpen: boolean
  isClosing: boolean
  open: (element?: HTMLElement | null) => void
  close: () => void
  onAnimationEnd: (e: React.AnimationEvent) => void
  animationStyle: React.CSSProperties | undefined
  modalRef: (node: HTMLDivElement | null) => void
  triggerRef: React.RefObject<HTMLElement | null>
}

export function useCardExpandAnimation(onClosed?: () => void): ExpandAnimationState {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [originRect, setOriginRect] = useState<DOMRect | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const onClosedRef = useRef(onClosed)
  onClosedRef.current = onClosed

  const open = useCallback((element?: HTMLElement | null) => {
    const el = element ?? triggerRef.current
    if (el) {
      setOriginRect(el.getBoundingClientRect())
    }
    setIsClosing(false)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsClosing(true)
  }, [])

  const onAnimationEnd = useCallback((e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return
    setIsClosing((closing) => {
      if (closing) {
        setIsOpen(false)
        queueMicrotask(() => onClosedRef.current?.())
      }
      return false
    })
  }, [])

  function getAnimationStyle(): React.CSSProperties | undefined {
    if (!originRect) return undefined
    const finalWidth = window.innerWidth * 0.5
    const finalLeft = window.innerWidth * 0.25
    const finalTop = Math.max(48, window.innerHeight * 0.1)
    return {
      '--offset-x': `${originRect.left - finalLeft}px`,
      '--offset-y': `${originRect.top - finalTop}px`,
      '--scale-x': originRect.width / finalWidth,
      '--scale-y': 1
    } as React.CSSProperties
  }

  const modalRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node && originRect) {
        const finalHeight = node.scrollHeight
        node.style.setProperty('--scale-y', String(originRect.height / finalHeight))
        node.style.animationPlayState = 'running'
      }
    },
    [originRect]
  )

  return {
    isOpen,
    isClosing,
    open,
    close,
    onAnimationEnd,
    animationStyle: getAnimationStyle(),
    modalRef,
    triggerRef
  }
}
