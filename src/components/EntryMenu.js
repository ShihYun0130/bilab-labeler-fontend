import { useEffect, useState, useRef } from 'react';
import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { makeStyles } from '@material-ui/core/styles';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useDispatch } from 'react-redux';

import { MRC_BASEURL } from '../config';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex'
  },
  button: {
    fontFamily: 'Poppins, sans-serif',
    fontSize: '25px',
    color: '#6184C6'
  },
  paper: {
    borderRadius: '10px',
    color: '#6184C6',
    width: '150%'
  },
  link: {
    textDecoration: 'none',
    color: '#6184C6'
  }
}));

export default function EntryMenu() {
  const focusProject = useSelector(
    (state) => state.projectReducer.focusProject
  );
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [taskTypeTitle, setTaskTypeTitle] = useState('');

  // query available tasks
  const profileObj = useSelector((state) => state.accountReducer.profileObj);
  const userId = useSelector((state) => state.accountReducer.userId);
  const [projects, setProjects] = useState();

  // change redux status and write to localStorage
  const dispatch = useDispatch();
  const dispatchProject = (item) => {
    dispatch({
      type: 'SETPROJECT',
      payload: { focusProject: item }
    });
  };

  useEffect(() => {
    const getProject = async () => {
      const arg = {
        userId: userId,
        statusCode: '0'
      };
      const res = await axios.get(`${MRC_BASEURL}/projects`);
      const projectsData = res.data.map((data) => ({
        projectId: data._id,
        projectName: data.name,
        projectType: data.type,
        labelInfo: data.rule
      }));
      console.log('projects', projectsData);
      setProjects(projectsData);
      if (res.data.length) {
        setTaskTypeTitle(focusProject.projectName);
      }
    };
    getProject();
  }, [profileObj.googleId]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleMenuItemClick = (event, index) => {
    // setSelectedIndex(index);
    // setAnchorEl(null);
    setTaskTypeTitle(projects[index].projectName);
    dispatchProject(projects[index]);
    handleClose(event);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

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
      <div>
        <Button
          ref={anchorRef}
          aria-controls={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
          className={classes.button}
        >
          {taskTypeTitle}
          <ArrowDropDownIcon />
        </Button>
        <Popper
          open={open}
          placement="bottom-start"
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps}>
              <Paper className={classes.paper}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="menu-list-grow"
                    onKeyDown={handleListKeyDown}
                  >
                    {projects
                      .sort(function (a, b) {
                        return a.projectId - b.projectId;
                      })
                      .map((project, index) => (
                        <Link
                          key={index}
                          className={classes.link}
                          to={`/${project.projectType}/Label/${project.projectId}`}
                        >
                          <MenuItem
                            key={index}
                            onClick={(event) =>
                              handleMenuItemClick(event, index)
                            }
                          >
                            {project.projectName}
                          </MenuItem>
                        </Link>
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
