import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { hudColors } from 'ui/theme/typography'
import { WIKI_SECTIONS } from './sections'

const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <Typography
      component="h1"
      sx={{ fontSize: 32, fontWeight: 700, color: hudColors.textBright, mb: 4, letterSpacing: 0.5 }}
    >
      {children}
    </Typography>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <Typography
      component="h2"
      sx={{
        fontSize: 20,
        fontWeight: 700,
        color: hudColors.textBright,
        mt: 8,
        mb: 3,
        pb: 1.5,
        borderBottom: `1px solid ${hudColors.borderSubtle}`
      }}
    >
      {children}
    </Typography>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <Typography component="h3" sx={{ fontSize: 15, fontWeight: 700, color: hudColors.textBright, mt: 5, mb: 2 }}>
      {children}
    </Typography>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <Typography sx={{ fontSize: 14, lineHeight: 1.7, color: hudColors.textBrightSoft, mb: 3 }}>{children}</Typography>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <Box component="a" href={href} sx={{ color: hudColors.progressBar, textDecoration: 'none' }}>
      {children}
    </Box>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <Box component="strong" sx={{ color: hudColors.textBright, fontWeight: 700 }}>
      {children}
    </Box>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <Box component="ul" sx={{ pl: 5, mb: 3, color: hudColors.textBrightSoft }}>
      {children}
    </Box>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <Box component="ol" sx={{ pl: 5, mb: 3, color: hudColors.textBrightSoft }}>
      {children}
    </Box>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <Box component="li" sx={{ fontSize: 14, lineHeight: 1.7, mb: 1 }}>
      {children}
    </Box>
  ),
  code: ({ children }: { children?: React.ReactNode }) => (
    <Box
      component="code"
      sx={{
        fontFamily: 'monospace',
        fontSize: 12.5,
        color: hudColors.textBright,
        backgroundColor: hudColors.listActive,
        px: 0.75,
        py: 0.25,
        borderRadius: '2px'
      }}
    >
      {children}
    </Box>
  ),
  pre: ({ children }: { children?: React.ReactNode }) => (
    <Box
      component="pre"
      sx={{
        fontFamily: 'monospace',
        fontSize: 12.5,
        lineHeight: 1.5,
        color: hudColors.textBrightSoft,
        backgroundColor: hudColors.surfaceDeep,
        border: `1px solid ${hudColors.borderSubtle}`,
        borderRadius: '2px',
        p: 3,
        mb: 3,
        overflowX: 'auto',
        '& code': { backgroundColor: 'transparent', p: 0, color: 'inherit' }
      }}
    >
      {children}
    </Box>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <Box sx={{ mb: 3, overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          borderCollapse: 'collapse',
          width: '100%',
          fontSize: 13,
          '& th, & td': {
            textAlign: 'left',
            padding: '8px 12px',
            borderBottom: `1px solid ${hudColors.borderFaint}`
          },
          '& th': { color: hudColors.textBright, fontWeight: 700, borderBottom: `1px solid ${hudColors.borderSubtle}` },
          '& td': { color: hudColors.textBrightSoft }
        }}
      >
        {children}
      </Box>
    </Box>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <Box
      component="blockquote"
      sx={{
        borderLeft: `3px solid ${hudColors.borderStrong}`,
        pl: 3,
        ml: 0,
        my: 3,
        color: hudColors.textBrightSoft,
        fontStyle: 'italic'
      }}
    >
      {children}
    </Box>
  ),
  hr: () => <Box component="hr" sx={{ border: 'none', borderTop: `1px solid ${hudColors.borderSubtle}`, my: 5 }} />
}

export const Wiki = () => {
  const [activeId, setActiveId] = useState(WIKI_SECTIONS[0].id)
  const active = WIKI_SECTIONS.find((s) => s.id === activeId) ?? WIKI_SECTIONS[0]

  return (
    <Stack
      direction="row"
      sx={{
        height: '100%',
        background: hudColors.menuGradient,
        border: `1px solid ${hudColors.borderStrong}`,
        borderRadius: '2px',
        overflow: 'hidden'
      }}
    >
      <Stack
        sx={{
          width: 240,
          flexShrink: 0,
          borderRight: `1px solid ${hudColors.borderSubtle}`,
          p: 3,
          gap: 0.5,
          overflowY: 'auto'
        }}
      >
        <Typography variant="hud-label" sx={{ color: hudColors.textBrightDim, px: 2, mb: 2 }}>
          Game Wiki
        </Typography>
        {WIKI_SECTIONS.map((section) => {
          const isActive = section.id === activeId
          return (
            <Box
              key={section.id}
              component="button"
              type="button"
              onClick={() => setActiveId(section.id)}
              sx={{
                appearance: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                border: 'none',
                borderRadius: '2px',
                px: 2,
                py: 1.5,
                fontSize: 13,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? hudColors.textBright : hudColors.textBrightSoft,
                backgroundColor: isActive ? hudColors.listActive : 'transparent',
                '&:hover': { backgroundColor: isActive ? hudColors.listActive : hudColors.listHover }
              }}
            >
              {section.title}
            </Box>
          )
        })}
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0, overflowY: 'auto', px: 8, py: 6 }}>
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {active.content}
          </Markdown>
        </Box>
      </Box>
    </Stack>
  )
}
