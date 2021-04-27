const initialState = {
    accessToken: 0,
    profileObj: {},
}

export default function accountReducer(state = initialState, action){
    console.log('action',action)
    switch(action.type){
        case "LOGIN":
            return {accessToken: action.payload.accessToken, profileObj: action.payload.profileObj}
        case "LOGOUT":
            return {accessToken: null, profileObj: null}
        default:
            return state;
    }
}