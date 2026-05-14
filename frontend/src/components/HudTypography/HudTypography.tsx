import { Typography } from '@mui/material'
import type { TypographyProps } from '@mui/material'
import type { HudTypographyVariant } from 'ui/theme/typography'

type HudTypographyProps = Omit<TypographyProps, 'variant'> & {
  variant: HudTypographyVariant
}

export const HudTypography = ({ variant, ...props }: HudTypographyProps) => (
  <Typography variant={variant} {...props} />
)
