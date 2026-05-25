import { Portal } from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'
import type React from 'react'
import type { ReactNode } from 'react'
import { hudColors } from 'ui/theme/typography'

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

const Backdrop = styled('div')<{ showBackdrop: boolean; isClosing: boolean }>(({ showBackdrop, isClosing }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: 1300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // While opening / open: show the dim layer. The moment `isClosing` flips to true the bgcolor
  // animates back to transparent — so the backdrop fades out simultaneously with the modal
  // scale/translate animation, instead of disappearing at the end via the unmount.
  backgroundColor: showBackdrop && !isClosing ? hudColors.overlayBlack : 'transparent',
  transition: 'background-color 0.3s cubic-bezier(0.2, 0, 0, 1)'
}))

// Modal chrome is baked in here so content components (BlueprintDetail / ModuleDetail / future
// uses) drop in without re-declaring the gradient + border + colour. Visually the panel reads
// as the same surface as the build menu beneath it.
const ModalContent = styled('div')<{ isClosing: boolean; modalWidth: string }>(({ isClosing, modalWidth }) => ({
  position: 'relative',
  width: modalWidth,
  background: hudColors.menuGradient,
  border: `1px solid ${hudColors.borderStrong}`,
  color: hudColors.textBright,
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
  /** CSS width value applied to the modal panel. Defaults to '30%'. */
  width?: string
  animationStyle: React.CSSProperties | undefined
  modalRef: (node: HTMLDivElement | null) => void
  onAnimationEnd: (e: React.AnimationEvent) => void
  onClose: () => void
}

export const ExpandModal = (props: ExpandModalProps) => {
  const {
    children,
    isClosing,
    showBackdrop = false,
    width = '30%',
    animationStyle,
    modalRef,
    onAnimationEnd,
    onClose
  } = props

  return (
    <Portal>
      <Backdrop showBackdrop={showBackdrop} isClosing={isClosing} onClick={onClose}>
        <ModalContent
          ref={modalRef}
          isClosing={isClosing}
          modalWidth={width}
          style={animationStyle}
          onAnimationEnd={onAnimationEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </ModalContent>
      </Backdrop>
    </Portal>
  )
}
