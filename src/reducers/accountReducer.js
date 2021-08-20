const initialState = {
  accessToken: 0,
  userId: '',
  profileObj: {},
};

export default function accountReducer(state = initialState, action) {
  console.log('action', action);
  switch (action.type) {
    case 'LOGIN':
      return {
        accessToken: action.payload.accessToken,
        userId: action.payload.userId,
        profileObj: action.payload.profileObj,
      };
    case 'LOGOUT':
      return { accessToken: null, profileObj: null };
    default:
      return state;
  }
}
