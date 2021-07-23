const initialState = {
    projects: [],
}

export default function projectReducer(state = initialState, action){
    switch(action.type){
        case "SETPROJECT":
            console.log('SETPROJECT', action.payload.focusProject)
            return {focusProject: action.payload.focusProject,}
        case "LOGIN":
            return {focusProject: {projectId: 1, projectName: "康健雜誌 MRC Test"}}
        default:
            return state;
    }
}