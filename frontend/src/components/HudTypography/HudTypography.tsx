import { Typography } from '@mui/material'
import type { PropsWithChildren } from 'react'

type HudTypographyProps = PropsWithChildren<{
  variant: 'title-large' | 'title-medium' | 'title-small' | 'body-large' | 'body-medium' | 'body-small'
}>

export const HudTypography = (props: HudTypographyProps) => {
  const { variant, children } = props

  switch (variant) {
    case 'title-large': {
      return (
        <Typography variant="h1" sx={{ fontSize: 20, letterSpacing: 2, fontWeight: 'bold' }}>
          {children}
        </Typography>
      )
    }
    case 'title-medium': {
      return (
        <Typography variant="h2" sx={{ fontSize: 15, letterSpacing: 1, mb: 1, fontWeight: 'bold' }}>
          {children}
        </Typography>
      )
    }
    case 'title-small': {
      return (
        <Typography variant="h3" sx={{ fontSize: 12, letterSpacing: 1, mb: 1, fontWeight: 'bold' }}>
          {children}
        </Typography>
      )
    }
    case 'body-large': {
      return (
        <Typography variant="body1" sx={{ fontSize: 15, letterSpacing: 1, mb: 1, fontWeight: 'bold' }}>
          {children}
        </Typography>
      )
    }
    case 'body-medium': {
      return (
        <Typography variant="body2" sx={{ fontSize: 15, letterSpacing: 1, mb: 1, fontWeight: 'bold' }}>
          {children}
        </Typography>
      )
    }
    case 'body-small': {
      return (
        <Typography variant="overline" sx={{ fontSize: 15, letterSpacing: 1, mb: 1, fontWeight: 'bold' }}>
          {children}
        </Typography>
      )
    }
  }
}
