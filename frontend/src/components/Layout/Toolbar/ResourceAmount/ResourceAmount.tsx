import { Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

const TICK_MS = 80

interface ResourceAmountProps {
  target: number
}

export const ResourceAmount = ({ target }: ResourceAmountProps) => {
  const [display, setDisplay] = useState(target)
  const prevRef = useRef(target)

  useEffect(() => {
    if (target === prevRef.current) return
    const from = prevRef.current
    prevRef.current = target
    const diff = target - from
    if (diff <= 0) {
      setDisplay(target)
      return
    }
    const steps = Math.min(diff, 60)
    let step = 0
    const id = setInterval(() => {
      step++
      const t = step / steps
      setDisplay(Math.round(from + diff * t))
      if (step >= steps) clearInterval(id)
    }, TICK_MS)
    return () => clearInterval(id)
  }, [target])

  return <Typography variant="caption">{display}</Typography>
}
