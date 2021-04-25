import './MainContentPage.css'
import '../components/_global.css'
import Header from '../components/Header'
import TitleCards from './TitleCards'
import ParagraphCards from './ParagraphCards'
import MRCLabel from './Labeling'
import SentimentalLabel from './SentiLabeling'
// import SentimentalLabel from './SentiValidationPage'
import MRCValidation from './ValidationPage' // temp
import ProjectManage from './ProjectManagePage' // temp
import React from 'react';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {
  Switch,
  Route,
  useRouteMatch,
  Redirect
} from "react-router-dom";

function MainContent(props) {
  let { path } = useRouteMatch();
  // console.log('path', path)

  return (
    <div id="MainContent">
      <Header isManagePage={false}/>
      <Switch>
        <Route path={`${path}/Label/:projectId/:articleId/:idx`}>
          { path === '/MRC' 
            ? <MRCLabel />
            : <SentimentalLabel />
          }
        </Route>
        <Route path={`${path}/Label/:projectId/:articleId`}>
          <ParagraphCards />
        </Route>
        <Route path={`${path}/Label/:projectId`}>
          <TitleCards type={props.type} />
        </Route>
        <Route path={`${path}/Validation`} component={MRCValidation} />
        <Route path={`${path}/ProjectManage`} component={ProjectManage} />
        <Redirect from={path} to={`${path}/Label`} />
      </Switch>
    </div>
  )
}

export default MainContent;