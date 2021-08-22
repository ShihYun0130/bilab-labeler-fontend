import './MainContentPage.css';
import '../components/_global.css';
import Header from '../components/Header';
import TitleCards from './TitleCards';
import ParagraphCards from './ParagraphCards';
import MRCLabel from './Labeling';
import SentimentalLabel from './SentiLabeling';
import SentimentalValidation from './SentiValidationPage';
import MRCValidation from './ValidationPage'; // temp
import React from 'react';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

function MainContent(props) {
  let { path } = useRouteMatch();
  const focusProject = useSelector(
    (state) => state.projectReducer.focusProject
  );
  console.log('path', path);

  return (
    <div id="MainContent">
      <Header isManagePage={false} />
      <Switch>
        <Route path={`${path}/Label/:projectId/:articleId/:idx`}>
          { path === '/MRC' 
            ? <MRCLabel  type="MRC" />
            : <SentimentalLabel type="Sentiment" />
          }
        </Route>
        <Route path={`${path}/Label/:projectId/:articleId`}>
          <ParagraphCards  type={props.type}/>
        </Route>
        <Route path={`${path}/Label/:projectId`}>
          <TitleCards type={props.type} />
        </Route>
        <Route path={`${path}/Validation`}>
          {path === '/MRC' ? <MRCValidation /> : <SentimentalValidation />}
        </Route>
        <Redirect from={path} to={`${path}/Label/${focusProject.projectId}`} />
      </Switch>
    </div>
  );
}

export default MainContent;
