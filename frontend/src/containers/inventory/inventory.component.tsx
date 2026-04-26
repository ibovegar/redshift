import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 200
}));

class Inventory extends React.Component<object, any> {
  state = {
    age: '',
    name: 'hai'
  };

  handleChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  public render() {
    return (
      <StyledFormControl>
        <InputLabel htmlFor="age-simple">Age</InputLabel>
        <Select
          value={this.state.age}
          onChange={this.handleChange}
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
  }
}

export default Inventory;
