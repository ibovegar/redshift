import React from 'react';
import { Upgrade } from 'models';
import { Box, Typography, Popover, Divider } from '@mui/material';
import {
  Input,
  ActiveInput,
  Dropdown,
  GainAvatar
} from './upgrade-select.styles';
import RemoveIcon from '@mui/icons-material/IndeterminateCheckBox';
import { PopoverOrigin } from '@mui/material/Popover';

interface Props {
  value: Upgrade;
  options: Upgrade[];
  type: string;
  onSelect: (option: Upgrade) => void;
  onDeselect: () => void;
  onHover?: (option: Upgrade) => void;
  onHoverEnd?: () => void;
}

const UpgradeSelect: React.FC<Props> = (props) => {
  const { value, options, type, onSelect, onDeselect, onHover, onHoverEnd } =
    props;
  const [anchorEl, setAnchorEl]: [any, any] = React.useState(null);

  const isDisabled = !value && options.length === 0;
  const isActive = !!value;

  const handleOpen = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    onHoverEnd?.();
  };

  const handleSelect = (option: Upgrade) => {
    handleClose();
    onSelect(option);
  };

  const handleDeselect = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDeselect();
  };

  const open = Boolean(anchorEl);
  const id = open ? `${type}spacecraft-control` : undefined;
  const placeholder = value ? value.name : options.length + ' available';
  const popoverOrigin: PopoverOrigin = { vertical: 'top', horizontal: 'left' };

  const InputComponent = isActive ? ActiveInput : Input;

  return (
    <div style={isDisabled ? { opacity: 0.4, pointerEvents: 'none' } : {}}>
      <Typography variant="overline">{type}</Typography>
      <InputComponent
        sx={{
          py: 1,
          px: 4,
          mb: 4,
          display: 'flex',
          alignItems: 'center'
        }}
        onClick={handleOpen}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline">{placeholder}</Typography>
        </Box>
        {value && <RemoveIcon fontSize="small" onClick={handleDeselect} />}
      </InputComponent>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={popoverOrigin}
        transformOrigin={popoverOrigin}
      >
        <Dropdown>
          {!options.length ? (
            <Box sx={{ py: 3, px: 8 }}>
              <Typography variant="subtitle1">NO AVAILABLE UPGRADES</Typography>
            </Box>
          ) : (
            options.map((option: Upgrade, index) => (
              <li
                key={option.id}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => onHover?.(option)}
                onMouseLeave={() => onHoverEnd?.()}
              >
                <Box sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      width: '80px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <GainAvatar>{option.gain}</GainAvatar>
                  </Box>
                  <Box sx={{ pr: 8, py: 3 }}>
                    <Typography style={{ whiteSpace: 'nowrap' }} variant="h6">
                      {option.name}
                    </Typography>
                    <Typography
                      style={{ whiteSpace: 'nowrap' }}
                      variant="subtitle1"
                    >
                      {option.manufacturer.toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
                {index + 1 !== options.length && <Divider />}
              </li>
            ))
          )}
        </Dropdown>
      </Popover>
    </div>
  );
};

export default UpgradeSelect;
