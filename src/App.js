import './App.css';
import MainContentPage from './views/MainContentPage'
import SocialLogin from './components/GoogleLogin';
import ProjectManage from './views/ProjectManagePage' // temp
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

function App() {
  // using redux state to watch for changes
  const accessToken = useSelector(state => state.accountReducer.accessToken);
  
  // if already logged in
  if(accessToken){
    return (
      <Router>
        <div className="App">
          <Switch>
            <Route path="/MRC" render={() => <MainContentPage type="MRC" />} />
            <Route path="/sentiment" render={() => <MainContentPage type="Sentiment" />} />
            <Route path={`/ProjectManage`} component={ProjectManage} />
            <Redirect from="/" to="/MRC" />
          </Switch>
        </div> 
      </Router>
    )
  }
  else{
    return(
      // login page
      <div className="App">
        <SocialLogin/>
      </div>
    )
  }

}

export default App;
