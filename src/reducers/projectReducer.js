const initialState = {
  projects: [],
};

export default function projectReducer(state = initialState, action) {
  switch (action.type) {
    case "SETPROJECT":
      console.log("SETPROJECT", action.payload.focusProject);
      return { focusProject: action.payload.focusProject };
    case "LOGIN":
      return {
        focusProject: {
          _id: "60e19242f136195b85ecdc97",
          name: "test MRC Name 1",
          type: "MRC",
          rule: "testing rule",
        },
      };
    default:
      return state;
  }
}
