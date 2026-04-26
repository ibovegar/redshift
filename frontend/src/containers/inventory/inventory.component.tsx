import React, { useState } from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 200
}));

const Inventory = () => {
  const [age, setAge] = useState('');

  const handleChange = (event: any) => {
    setAge(event.target.value);
  };

  return (
    <StyledFormControl>
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
    </StyledFormControl>
  );
};

export default Inventory;
