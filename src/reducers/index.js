import { combineReducers } from 'redux'
import accountReducer from './accountReducer'
import projectReducer from './projectReducer'

const rootReducer = {
    accountReducer,
    projectReducer
}
export default combineReducers(rootReducer)