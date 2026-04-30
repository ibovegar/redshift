import { keyframes, styled } from '@mui/material/styles'
import { type ReactNode, useCallback, useRef, useState } from 'react'

const BAR_WIDTH = 2

const EASINGS = [
  'cubic-bezier(0.76, 0, 0.24, 1)',
  'cubic-bezier(0.33, 1, 0.68, 1)',
  'cubic-bezier(0.65, 0, 0.35, 1)',
  'cubic-bezier(0.45, 0, 0.55, 1)',
  'cubic-bezier(0.22, 1, 0.36, 1)',
  'cubic-bezier(0.87, 0, 0.13, 1)'
]

function randomEasing(): string {
  return EASINGS[Math.floor(Math.random() * EASINGS.length)]
}

function generateColors(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const hue = Math.round((360 / count) * i)
    return `hsl(${hue}, 75%, 60%)`
  })
}

interface BarButtonProps {
  children: ReactNode
}

const barRise = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  20% {
    opacity: 0.7;
  }
  40% {
    transform: translateY(0);
  }
  55% {
    transform: translateY(0);
  }
  80% {
    opacity: 0.7;
  }
  100% {
    transform: translateY(-110%);
    opacity: 0;
  }
`

const Root = styled('span')({
  position: 'relative',
  display: 'inline-flex',
  overflow: 'hidden',
  borderRadius: 'inherit',
  clipPath: `polygon(
    0 0, 0 0,
    100% 0%, 100% 0,
    100% 100%, 100% 100%,
    10px 100%, 0% calc(100% - 10px))`
})

const BarContainer = styled('span')({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '100%',
  display: 'flex',
  alignItems: 'flex-end',
  pointerEvents: 'none',
  zIndex: 1
})

const Bar = styled('span')<{ color: string; delay: number; easing: string }>(({ color, delay, easing }) => ({
  flex: 1,
  height: '100%',
  backgroundColor: color,
  opacity: 0.3,
  transform: 'translateY(100%)',
  animation: `${barRise} 0.25s ${easing} ${delay}ms forwards`
}))

export const BarButton = (props: BarButtonProps) => {
  const { children } = props

  const rootRef = useRef<HTMLSpanElement>(null)
  const [animKey, setAnimKey] = useState(0)
  const [active, setActive] = useState(false)
  const [bars, setBars] = useState<{ color: string; delay: number; easing: string }[]>([])

  const handleMouseEnter = useCallback(() => {
    const width = rootRef.current?.offsetWidth ?? 0
    const barCount = Math.max(1, Math.round(width / BAR_WIDTH))
    const colors = generateColors(barCount)
    const shuffled = colors.sort(() => Math.random() - 0.5)
    const randomBars = shuffled.map((color) => ({
      color,
      delay: Math.round(Math.random() * 100),
      easing: randomEasing()
    }))
    setBars(randomBars)
    setAnimKey((k) => k + 1)
    setActive(true)
  }, [])

  return (
    <Root ref={rootRef} onMouseEnter={handleMouseEnter}>
      {active && (
        <BarContainer key={animKey}>
          {bars.map((bar) => (
            <Bar key={bar.color} color={bar.color} delay={bar.delay} easing={bar.easing} />
          ))}
        </BarContainer>
      )}
      {children}
    </Root>
  )
}

export type { BarButtonProps }
