import { type Components, createTheme, type PaletteOptions, type Theme } from '@mui/material/styles'
import { hudColors, hudTypographyVariants } from './typography'

declare module '@mui/material/styles' {
  interface Palette {
    hud: typeof hudColors
  }
  interface PaletteOptions {
    hud?: Partial<typeof hudColors>
  }
}

const spacing = 4

const sapphire = {
  light: '#809fff',
  main: '#2040e0',
  dark: '#152a8a',
  contrastText: '#fff'
}

const palette: PaletteOptions = {
  mode: 'dark',
  primary: sapphire,
  secondary: {
    light: '#f4c5c2', // progress light red
    main: '#f44336', // progress red
    dark: '#',
    contrastText: '#000'
  },
  grey: {
    50: '#141d29',
    100: '#151e2a',
    200: '#16212e',
    300: '#182330',
    400: '#1a2532',
    500: '#1f2936',
    600: '#202b37',
    700: '#26313d',
    800: '#2e3843',
    900: '#3b444f',
    A100: '#444d57',
    A200: '#515963',
    A400: '#606770',
    A700: '#81878e'
  },
  background: {
    paper: 'rgba(21,30,42, 0.9)', // '#16212e',
    default: '#13161f'
  },
  common: {
    black: '#000',
    white: '#fff'
  },
  action: {
    hover: '#2e3843',
    selected: '#19385b',
    disabledBackground: '#3b444f'
  },
  hud: hudColors,
}

const components: Components<Theme> = {
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        'hud-title': 'p',
        'hud-heading': 'p',
        'hud-label': 'p',
        'hud-tag': 'p',
        'hud-badge': 'p',
        'hud-data-xl': 'p',
        'hud-data': 'p',
        'hud-body': 'p',
        'hud-mono': 'p',
        'hud-alarm': 'p',
      }
    }
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: 'none'
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 2,
        clipPath: `polygon(
          0 0, 0 0, /* top-left */
          100% 0%, 100% 0, /* top-right */
          100% 100%, 100% 100%, /* bottom-right */
          10px 100%, 0% calc(100% - 10px)) /* bottom-left */`,
        transition: 'none'
        // '&:hover': {
        //   backgroundColor: 'rgba(128, 159, 255, 0.25)'
        // }
      }
    }
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        height: 2
      }
    }
  },
  MuiPopover: {
    styleOverrides: {
      paper: {
        backgroundColor: '#202b37',
        borderRadius: '2px'
      }
    }
  }
}

export const ThemeDark = createTheme({
  spacing,
  palette,
  components,
  typography: {
    h1: { fontSize: '3.5rem' },
    h2: { fontSize: '2.75rem' },
    h3: { fontSize: '2rem', fontWeight: 300 },
    h4: { fontSize: '1.5rem', fontWeight: 300 },
    h5: { fontSize: '1.25rem', fontWeight: 400 },
    h6: { fontSize: '1rem' },
    subtitle1: { fontSize: '0.85rem' },
    subtitle2: { fontSize: '0.7rem' },
    ...hudTypographyVariants,
  }
})
