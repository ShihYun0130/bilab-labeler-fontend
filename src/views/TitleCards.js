import './TitleCards.css';
import { useParams, useRouteMatch, Link, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BASEURL, MRC_BASEURL } from '../config';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import { fakeSentimentalTitles } from './fakeData';
import { useSelector } from 'react-redux';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

function TitleCards(props) {
  let history = useHistory();
  let { path } = useRouteMatch();
  let { projectId } = useParams();
  const [articles, setArticles] = useState();
  const profileObj = useSelector((state) => state.accountReducer.profileObj);
  const projectDetail = useSelector(
    (state) => state.projectReducer.focusProject
  );
  const [labelInfo, setLabelInfo] = useState('');
  const [open, setOpen] = useState(false);

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  useEffect(() => {
    const getArticles = async () => {
      let actionURL = MRC_BASEURL + '/articles';
      const response = await axios.get(actionURL, {
        params: {
          projectId: projectId,
        },
      });
      console.log('articles', response);
      const articlesData = response.data.map((data) => ({
        articleId: data._id,
        articleTitle: data.title,
        projectId: data.projectId,
        totalTaskNum: data.totalTaskNum,
      }));
      setArticles(articlesData);
      setLabelInfo(projectDetail.labelInfo);
    };
    const getSentiArticles = async () => {
      let actionURL = BASEURL + '/sentiArticles';
      let arg = {
        userId: profileObj.googleId,
        projectId: projectId,
      };
      const response = await axios.post(actionURL, arg);
      setArticles(response.data.articleList);
      setLabelInfo(response.data.labelInfo);
    };
    // console.info(props.type)
    if (!props.type || props.type === 'MRC') {
      getArticles();

    } 
    else if (props.type === "Sentiment") {
      // console.log('hehe');
      getSentiArticles();  
      
    } 
    else {
      setArticles(fakeSentimentalTitles)

    }
  }, [props.type, profileObj.googleId, projectId]);

  // When api not get responding
  if (!articles || !articles.length) {
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
          <Link
            key={idx}
            className="title-card-link"
            to={`${history.location.pathname}/${article.articleId}`}
          >
            <div className="title-card">
              {article.articleTitle.slice(0, 30) + '...'}
            </div>
          </Link>
        ))}
      </div>
      <div className="btn-popup" onClick={onOpenModal}>
        <ErrorOutlineRoundedIcon fontSize="large"></ErrorOutlineRoundedIcon>
      </div>
      <Modal open={open} onClose={onCloseModal} center>
        <h2 className="modal-header">標註注意事項</h2>
        <div className="modal-text">
          {labelInfo.split('\n').map((i, key) => {
            return <p key={key}>{i}</p>;
          })}
        </div>
      </Modal>
    </div>
  );
}

export default TitleCards;
