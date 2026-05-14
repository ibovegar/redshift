import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App } from 'containers/App/App'
import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { ThemeDark } from './ui/theme/dark'

import './assets/css/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10
    }
  }
})

const app = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider theme={ThemeDark}>
        <CssBaseline />
        <Suspense fallback={<div>Loading...</div>}>
          <App />
        </Suspense>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
)

async function startMocking() {
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')
const root = createRoot(rootElement)

startMocking().then(() => {
  root.render(app)
})
