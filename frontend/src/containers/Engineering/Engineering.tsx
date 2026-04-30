import { Button, Stack } from '@mui/material'
import Box from '@mui/material/Box'
import { Placeholder, SpacecraftList } from 'components'
import { useSpacecrafts } from 'hooks'
import type React from 'react'
import { useCallback } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router'
import { SpacecraftBuilder } from './SpacecraftBuilder/SpacecraftBuilder'

export const Engineering = () => {
  const { data: spacecrafts } = useSpacecrafts()
  const navigate = useNavigate()

  const handleSelectSpacecraft = useCallback(
    (event: React.MouseEvent) => {
      navigate(event.currentTarget.id)
    },
    [navigate]
  )

  if (!spacecrafts.length) {
    return (
      <Placeholder
        message="INVENTORY IS EMPTY"
        action={
          <Button color="primary" variant="contained" component={Link} to="/marketplace">
            GO TO STORE
          </Button>
        }
      />
    )
  }

  return (
    <Stack direction="row" sx={{ height: '100%' }}>
      <Box
        sx={{
          width: 340,
          height: '100%',
          border: 1,
          borderColor: 'grey.700'
        }}
      >
        <SpacecraftList spacecrafts={spacecrafts} onSpacecraftClick={handleSelectSpacecraft} />
      </Box>
      <Box sx={{ flex: 1, height: '100%' }}>
        <Routes>
          <Route path=":spacecraftId" element={<SpacecraftBuilder />} />
          <Route path="/" element={<Placeholder message="PLEASE SELECT A SPACECRAFT" />} />
        </Routes>
      </Box>
    </Stack>
  )
}
