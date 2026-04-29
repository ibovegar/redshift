import { type Components, createTheme, type PaletteOptions, type Theme } from '@mui/material/styles'

const spacing = 4

const palette: PaletteOptions = {
  mode: 'light',
  primary: {
    light: '#f44336',
    main: '#f44336', // AppBar
    dark: '#f44336', // Select color, tabs underline
    contrastText: '#fff'
  },
  secondary: {
    light: '#f4c5c2', // progress light red
    main: '#f44336', // progress red
    dark: '#ba000d',
    contrastText: '#000'
  },
  grey: {
    50: '#f7f9fa',
    100: '#f1f4f6',
    200: '#e9eef0',
    300: '#e7ecef',
    400: '#e1e8eb',
    500: '#dee5e9',
    600: '#d9e1e5',
    700: '#d1dadf',
    800: '#ccd7dc',
    900: '#c5d1d6',
    A100: '#d5d5d5',
    A200: '#aaaaaa',
    A400: '#303030',
    A700: '#616161'
  },
  background: {
    paper: '#fff',
    default: '#fff'
  },
  common: {
    black: '#000',
    white: '#fff'
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)', // Select items color
    secondary: 'rgba(0, 0, 0, 0.54)', // select placeholder color
    disabled: 'rgba(0, 0, 0, 0.38)'
  },
  action: {
    hover: '#f1f4f6',
    selected: '#e1e8eb'
  }
}

const components: Components<Theme> = {
  // MuiMenuItem: {
  //   styleOverrides: {
  //     root: {
  //       '&:hover': {
  //         backgroundColor: palette.grey![100]
  //       },
  //       '&.Mui-selected': {
  //         backgroundColor: palette.grey![500]
  //       }
  //     }
  //   }
  // }
}

export default createTheme({ spacing, palette, components })
