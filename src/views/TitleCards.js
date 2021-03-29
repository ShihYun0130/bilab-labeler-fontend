import './TitleCards.css'
import { useRouteMatch,Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { BASEURL } from "../config";
import axios from "axios";
import Loader from "react-loader-spinner";
import { fakeSentimentalTitles } from './fakeData'
import { useSelector} from 'react-redux';

function TitleCards(props) {
  let { path } = useRouteMatch();
  const [articles, setArticles] = useState();
  const profileObj = useSelector(state => state.profileObj);

  useEffect(() => {
    const getArticles = async() => {
      let actionURL = BASEURL + '/articles'
      let arg = {
        "userId": profileObj.googleId,
      }
      const response = await axios.post(actionURL, arg)
      setArticles(response.data);
      // console.info(articles)
  
    }
    const getSentiArticles = async() => {
      let actionURL = BASEURL + '/sentiArticles'
      let arg = {
        "userId": profileObj.googleId,
      }
      const response = await axios.post(actionURL, arg)
      setArticles(response.data);
  
    }
    // console.info(props.type)
    if (!props.type || props.type === "MRC") {
      getArticles();
    } 
    else if (props.type === "Sentimental") {
      getSentiArticles();  
    } 
    else {
      setArticles(fakeSentimentalTitles)
    }
  }, [props.type, profileObj.googleId]);

  // When api not get responding
  if(!articles || !articles.length) {
    return (
      <Loader
        className="center"
        type="RevolvingDot"
        color="#4D87EB"
        height={100}
        width={100}
        timeout={3000} //3 secs
      />
    );
  }

  return (
    <div className="title-card-container">
      <div className="start-start flex-wrap">
        {articles.map((article, idx) => (
          <Link key={idx} className="title-card-link" to={`${path}/${article.articleId}`}>
            <div className="title-card">
              {article.articleTitle}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default TitleCards;