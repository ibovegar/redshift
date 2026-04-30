import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material'
import { useState } from 'react'

export const Inventory = () => {
  const [age, setAge] = useState('')

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value)
  }

  return (
    <FormControl sx={{ m: 1, minWidth: 200 }}>
      <InputLabel htmlFor="age-simple">Age</InputLabel>
      <Select
        value={age}
        onChange={handleChange}
        inputProps={{
          name: 'age',
          id: 'age-simple'
        }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Ten</MenuItem>
        <MenuItem value={20}>Twenty</MenuItem>
        <MenuItem value={30}>Thirty</MenuItem>
      </Select>
    </FormControl>
  )
}
