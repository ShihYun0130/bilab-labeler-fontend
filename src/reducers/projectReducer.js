const initialState = {};

export default function projectReducer(state = initialState, action) {
  switch (action.type) {
    case 'SETPROJECT':
      console.log('SETPROJECT', action.payload.focusProject);
      return { focusProject: action.payload.focusProject };
    case 'LOGIN':
      return {
        focusProject: {
          projectId: '60e19242f136195b85ecdc97',
          projectName: 'test MRC Name 1',
          projectType: 'MRC',
          labelInfo: 'testing rule',
        },
      };
    default:
      return state;
  }
}
