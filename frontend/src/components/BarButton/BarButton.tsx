import { keyframes, styled, useTheme } from '@mui/material/styles'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

const BAR_WIDTH = 6

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

function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let h = 0
  if (max === r) h = ((g - b) / d) % 6
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return Math.round(h * 60 + 360) % 360
}

function generateColors(count: number, baseHue: number): string[] {
  return Array.from({ length: count }, () => {
    const hue = baseHue + Math.round(Math.random() * 50 - 25)
    const lightness = 30 + Math.round(Math.random() * 40)
    return `hsl(${hue}, 75%, ${lightness}%)`
  })
}

function generateActiveColors(count: number, color: string): string[] {
  return Array.from({ length: count }, () => color)
}

interface BarButtonProps {
  children: ReactNode
  active?: boolean
}

const barRise = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  40% {
    transform: translateY(0);
  }
  55% {
    transform: translateY(0);
  }
  80% {
    opacity: 1;
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
  borderRadius: 2,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '10px 0 0 10px',
    borderColor: 'transparent transparent transparent var(--bar-button-bg, #000)',
    zIndex: 3,
    pointerEvents: 'none'
  }
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

const Bar = styled('span')<{
  color: string
  delay: number
  easing: string
  animate: boolean
}>(({ color, delay, easing, animate }) => ({
  flex: 1,
  height: '100%',
  backgroundColor: color,
  opacity: 0,
  transform: 'translateY(100%)',
  ...(animate && {
    animation: `${barRise} 0.25s ${easing} ${delay}ms forwards`
  })
}))

const StaticBar = styled('span')<{ color: string }>(({ color }) => ({
  flex: 1,
  height: '100%',
  backgroundColor: color
}))

export const BarButton = (props: BarButtonProps) => {
  const { children, active } = props
  const theme = useTheme()

  const rootRef = useRef<HTMLSpanElement>(null)
  const [animKey, setAnimKey] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [bars, setBars] = useState<{ key: string; color: string; delay: number; easing: string }[]>([])
  const [activeBars, setActiveBars] = useState<{ key: string; color: string }[]>([])

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const width = el.offsetWidth
    const barCount = Math.max(1, Math.round(width / BAR_WIDTH))
    const primaryHue = hexToHue(theme.palette.primary.main)
    const colors = generateColors(barCount, primaryHue)
    const shuffled = colors.sort(() => Math.random() - 0.5)
    const randomBars = shuffled.map((color, i) => ({
      key: `${i}-${color}`,
      color,
      delay: Math.round(Math.random() * 100),
      easing: randomEasing()
    }))
    setBars(randomBars)

    const activeColors = generateActiveColors(barCount, theme.palette.primary.main)
    setActiveBars(activeColors.map((color, i) => ({ key: `a${i}-${color}`, color })))
  }, [theme.palette.primary.main])

  const handleMouseEnter = useCallback(() => {
    setAnimate(false)
    requestAnimationFrame(() => {
      setAnimKey((k) => k + 1)
      setAnimate(true)
    })
  }, [])

  return (
    <Root ref={rootRef} onMouseEnter={handleMouseEnter} data-bar-button>
      {bars.length > 0 && animate && !active && (
        <BarContainer key={animKey}>
          {bars.map((bar) => (
            <Bar key={bar.key} color={bar.color} delay={bar.delay} easing={bar.easing} animate={animate} />
          ))}
        </BarContainer>
      )}
      {activeBars.length > 0 && active && (
        <BarContainer>
          {activeBars.map((bar) => (
            <StaticBar key={bar.key} color={bar.color} />
          ))}
        </BarContainer>
      )}
      {children}
    </Root>
  )
}

export type { BarButtonProps }
