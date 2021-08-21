import { combineReducers } from 'redux';
import accountReducer from './accountReducer';
import projectReducer from './projectReducer';
import taskReducer from './taskReducer';

const rootReducer = {
  accountReducer,
  projectReducer,
  taskReducer,
};
export default combineReducers(rootReducer);
