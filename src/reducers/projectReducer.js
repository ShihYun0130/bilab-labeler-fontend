const initialState = {
    projects: [],
}

export default function projectReducer(state = initialState, action){
    switch(action.type){
        case "SETPROJECT":
            console.log('SETPROJECT', action.payload.focusProject)
            return {focusProject: action.payload.focusProject,}
        default:
            return state;
    }
}