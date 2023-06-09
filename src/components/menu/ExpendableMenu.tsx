import React, { FC, useState } from 'react';
import { eachDayOfInterval, format } from "date-fns";
import { Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from "../../icons/menu-icon.png";
import ArrowUpIcon from "../../icons/up.svg";
import ArrowDownIcon from "../../icons/down.svg";
import LogoutIcon from "../../icons/logout.svg";
import styles from '../menu/expendablemenu.module.css';

interface MenuProps {
  currentDay: Date;
  endingDay: Date;
  setCurrentDay: (value: Date) => void;
  setEndingDay: (value: Date) => void;
  setWeek: (value: Date[]) => void;
}

const { 
  container, wrapper, button, buttonFlex, buttonFlexContainer, 
  iconStyle, selectButton, menuItem, menu
} = styles;

const ExpendableMenu: FC<MenuProps> = ({
  currentDay,
  endingDay,
  setCurrentDay,
  setEndingDay,
  setWeek,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleUpArrow = () => {
    const startDay = new Date(currentDay.setDate(currentDay.getDate() - 7));
    const endDay = new Date(endingDay.setDate(endingDay.getDate() - 7));
    setCurrentDay(startDay);
    setEndingDay(endDay);
  }

  const handleDownArrow = () => {
    const startDay = new Date(currentDay.setDate(currentDay.getDate() + 7));
    const endDay = new Date(endingDay.setDate(endingDay.getDate() + 7));
    setCurrentDay(startDay);
    setEndingDay(endDay);
  }

  const handleSelectWeek = () => {
    const days = eachDayOfInterval({ start: currentDay, end: endingDay });
    setWeek(days);
    setAnchorEl(null);
  }

  return (
    <div className={container}>
      <Button
        variant="outlined"
        id="demo-positioned-button"
        aria-controls={open ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        className={button}
      >
        <img src={MenuIcon} alt="Menu" />
      </Button>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={() =>  setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        className={menu}
      >
        <div className={wrapper}>
          <div className={buttonFlexContainer}>
            <div className={buttonFlex}>
              <Button className={iconStyle} onClick={handleUpArrow}><img src={ArrowUpIcon} alt="Up" /></Button>
              <Button className={iconStyle} onClick={handleDownArrow}><img src={ArrowDownIcon} alt="Down" /></Button>
            </div>
            <Button
              className={selectButton}
              onClick={handleSelectWeek}
            >
              {format(currentDay, 'dd/MM/yyyy')} - {format(endingDay, 'dd/MM/yyyy')}
            </Button>
          </div>
          <MenuItem onClick={() => null} className={menuItem}>
            <img src={LogoutIcon} alt="Log out" />
          </MenuItem>
        </div>
      </Menu>
    </div>
  );
}

export default ExpendableMenu