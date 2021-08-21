const initialState = {};

export default function taskReducer(state = initialState, action) {
  switch (action.type) {
    case 'SETTASKS':
      console.log('SETTASKS', action.payload.tasks);
      return { tasks: action.payload.tasks };
    default:
      return state;
  }
}
