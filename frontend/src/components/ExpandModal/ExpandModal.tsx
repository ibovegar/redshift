import { keyframes, styled } from '@mui/material/styles'
import type React from 'react'
import type { ReactNode } from 'react'

const expandOpen = keyframes`
  from {
    transform: translate(var(--offset-x), var(--offset-y)) scale(var(--scale-x), var(--scale-y));
    opacity: 0.5;
  }
  to {
    transform: translate(0, 0) scale(1, 1);
    opacity: 1;
  }
`

const expandClose = keyframes`
  0% {
    transform: translate(0, 0) scale(1, 1);
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    transform: translate(var(--offset-x), var(--offset-y)) scale(var(--scale-x), var(--scale-y));
    opacity: 0;
  }
`

const Backdrop = styled('div')<{ showBackdrop: boolean }>(({ showBackdrop }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  backgroundColor: showBackdrop ? 'rgba(0, 0, 0, 0.6)' : 'transparent'
}))

const ModalContent = styled('div')<{ isClosing: boolean }>(({ isClosing }) => ({
  position: 'relative',
  width: '50%',
  marginTop: 'max(48px, 10vh)',
  transformOrigin: 'top left',
  animationDuration: '0.3s',
  animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
  animationFillMode: 'forwards',
  animationPlayState: 'paused',
  animationName: `${isClosing ? expandClose : expandOpen}`
}))

interface ExpandModalProps {
  children: ReactNode
  isClosing: boolean
  showBackdrop?: boolean
  animationStyle: React.CSSProperties | undefined
  modalRef: (node: HTMLDivElement | null) => void
  onAnimationEnd: (e: React.AnimationEvent) => void
  onClose: () => void
}

export const ExpandModal = (props: ExpandModalProps) => {
  const { children, isClosing, showBackdrop = false, animationStyle, modalRef, onAnimationEnd, onClose } = props

  return (
    <Backdrop showBackdrop={showBackdrop} onClick={onClose}>
      <ModalContent
        ref={modalRef}
        isClosing={isClosing}
        style={animationStyle}
        onAnimationEnd={onAnimationEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </ModalContent>
    </Backdrop>
  )
}
