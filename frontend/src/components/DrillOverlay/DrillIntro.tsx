import { ChevronRight } from '@mui/icons-material'
import { Backdrop, Box, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material'
import { HudButton } from 'components/HudButton/HudButton'

export function DrillIntro({ onStart }: { onStart: () => void }) {
  return (
    <Backdrop open sx={{ zIndex: 21, cursor: 'default', pointerEvents: 'auto' }}>
      <Box
        sx={{
          minWidth: 400,
          px: 6,
          py: 6,
          fontFamily: 'monospace',
          textAlign: 'center',
          bgcolor: 'black',
          borderRadius: '5px'
        }}
      >
        <Stack spacing={4}>
          <Typography variant="h5" sx={{ color: 'primary.main', fontFamily: 'monospace', fontWeight: 'bold' }}>
            ASTEROID MINING
          </Typography>

          <div>
            <Typography
              gutterBottom
              variant="subtitle2"
              sx={{ fontFamily: 'monospace', opacity: 0.65, lineHeight: 1.4 }}
            >
              Track the moving target with your cursor.
            </Typography>
            <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', opacity: 0.65, lineHeight: 1.4 }}>
              Stay centered for maximum drill speed.
            </Typography>
          </div>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <List dense disablePadding>
              {[
                'Orbit the target in circles for a speed bonus',
                'Click when the blue ring hits the sweet spot',
                'Avoid red fracture zones or lose drill health',
                'Dull drills mine slower \u2014 stay on target'
              ].map((text) => (
                <ListItem key={text} disableGutters disablePadding>
                  <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary' }}>
                    <ChevronRight sx={{ fontSize: 14 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    slotProps={{
                      primary: {
                        variant: 'subtitle2',
                        sx: { fontFamily: 'monospace', opacity: 0.65, lineHeight: 1.4, fontWeight: 'bold' }
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', opacity: 0.65, lineHeight: 1.4 }}>
            Deeper deposits are harder to track.
          </Typography>

          <Box
            sx={{
              '@keyframes drillIntroPulse': {
                '0%, 100%': { opacity: 0.7 },
                '50%': { opacity: 1 }
              },
              animation: 'drillIntroPulse 1.5s ease-in-out infinite'
            }}
          >
            <HudButton variant="secondary" onClick={onStart}>
              START MINING
            </HudButton>
          </Box>
        </Stack>
      </Box>
    </Backdrop>
  )
}
