import { useEffect, useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch} from 'react-redux';
import { useHistory, useRouteMatch } from "react-router-dom";

import { accountMenu } from '../config';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
  button: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '25px',
    color: '#6184C6',
  },
  paper: {
    borderRadius: '10px',
    color: '#6184C6',
    width: '150%'
  },
  link: {
    textDecoration: 'none',
    color: '#6184C6',
  }
}));

export default function AccountMenu() {
  let { url } = useRouteMatch();
  let history = useHistory();

  const classes = useStyles();
  const [open, setOpen] = useState(false);
  // const [selectedIndex, setSelectedIndex] = useState(0);
  const anchorRef = useRef(null);
  // useEffect(() => {
  //   const task = accountMenu.options.filter(option => option.type === url.replace('/', ''))
  // }, [url])

  // dispatch redux logout action
  const dispatch = useDispatch();
  const logout = () => {
        console.log("clearLoginInfo")
        dispatch({
            type: 'LOGOUT'
        });
    };
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleMenuItemClick = (event, optionType) => {
    // setSelectedIndex(index);
    // setAnchorEl(null);
    switch(optionType) {
      case "ProjectManage":
        history.push(optionType)
        break;
      case "Logout":
        logout();
        break;
      default:
        break;
    }
    handleClose(event);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const profileObj = useSelector(state => state.profileObj);
  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <div className={classes.root}>
      <div className="justify-end">
        <div className="header-router-button w-120"><span className="f-25 mb-5">Hi,</span> {profileObj.givenName}</div>
        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className={classes.button}
        >
          <img className="user-image" src={profileObj.imageUrl} alt=""/>
        </Button>
        <Popper open={open} placement='bottom-start' anchorEl={anchorRef.current} role={undefined} transition disablePortal>
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
            >
              <Paper className={classes.paper}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
                  {accountMenu.options.map((option, index) => (
                      <MenuItem
                        key={index} 
                        onClick={(event) => handleMenuItemClick(event, option.type)}>
                        {option.title}
                      </MenuItem>
                  ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </div>
  );
}