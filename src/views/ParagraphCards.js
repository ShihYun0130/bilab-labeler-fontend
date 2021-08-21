import './ParagraphCards.css';
import { useParams, useRouteMatch, useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MRC_BASEURL, BASEURL } from '../config';
import axios from 'axios';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import Loader from 'react-loader-spinner';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

function ParagraphCards(props) {
  let history = useHistory();
  let { url } = useRouteMatch();
  let { articleId } = useParams();
  const [articleTitle, setArticleTitle] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  let isLabeled = true;
  const profileObj = useSelector((state) => state.accountReducer.profileObj);
  const dispatch = useDispatch();

  useEffect(() => {
    const getSetParagraphs = async () => {
      let actionURL = MRC_BASEURL + '/tasks';
      const response = await axios.get(actionURL, {
        params: {
          articleId: articleId,
        },
      });
      // console.log('response', response);
      response.data.forEach((value, index, array) => {
        array[index] = {
          taskId: value._id,
          context: value.content,
          answered: value.isAnswered,
          articleTitle: value.articleId.title,
          idx: index,
        };
      });
      // console.log('response', response);
      setParagraphs(response.data);
      setArticleTitle(response.data[0].articleTitle);
      // setqaList(response.data.qaList)
    };
    const getSetSentiParagraphs = async () => {
      let actionURL = BASEURL + '/sentiTasks';
      let arg = {
        userId: profileObj.googleId,
        taskType: 'sentiment',
        articleId: articleId,
      };
      const response = await axios.post(actionURL, arg);
      // console.log('res', response)
      setParagraphs(response.data.taskList);
      setArticleTitle(response.data.articleTitle);
      // setqaList(response.data.qaList)
    };
    // getSetParagraphs();
    // console.info(url)
    if (!props.type || props.type === 'MRC') {
      getSetParagraphs();
    } else if (props.type === 'Sentimental') {
      getSetSentiParagraphs();
    }
  }, [articleId, profileObj.googleId]);

  // When api not get responding
  if (!paragraphs || !paragraphs.length) {
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

  const goToLabel = (selectedTaskIdx) => {
    // let idx = taskId.split("-")[1];
    // const data = {
    //   articleId: articleId,
    //   articleTitle: articleTitle,
    //   taskId: taskId,
    //   totalTaskNum: paragraphs.length,
    //   paragraph: paragraphs[idx]
    // };
    // sessionStorage.setItem("paragraph", JSON.stringify(data));

    // save all taskData to localStorage

    const dispatchTaskList = () => {
      dispatch({
        type: 'SETTASKS',
        payload: { tasks: paragraphs },
      });
    };
    dispatchTaskList();

    history.push(`${url}/${selectedTaskIdx}`);
  };

  return (
    <div id="Paragraphs" className="center-center">
      <div className="paragraph-title-container justify-start f-20">
        <div className="line" />
        <div className="center-center mb-3">
          {articleTitle.slice(0, 30) + '...'}
        </div>
      </div>
      <div className="start-start flex-wrap">
        {paragraphs.map((paragraph, idx) => (
          <div
            key={idx}
            className="paragraph-link"
            onClick={() => {
              goToLabel(idx);
            }}
          >
            <div
              key={idx}
              className={`paragraph-card-container center-center f-16 
                ${paragraph.answered ? 'paragraph-is-labeled' : ''}`}
            >
              {/* <div className="paragraph-counter center-center mb-20">
                {paragraph.answered}
              </div> */}
              <div>{paragraph.context.slice(0, 50) + '...'}</div>
            </div>
          </div>
        ))}
        <div
          className={`paragraph-card-container center-center f-16 
              ${isLabeled ? 'paragraph-is-labeled' : ''}`}
        >
          <div className="paragraph-counter center-center mb-20">0</div>
          <div className="paragraph-content">
            【這篇是示範標過的會變淡】普遍建議複雜一點的比較好。多年前，有項刊登在新英格蘭醫學期刊的研究分析，
            在各種不同類別的運動當中，跳舞是失智症風險最低的絕佳運動選擇，因為跳舞...
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParagraphCards;
