import { Link, useRouteMatch, useHistory } from "react-router-dom";
import './SentiLabeling.css'
import { fakeAspectPool } from './fakeData'
import {useEffect, useState} from 'react';
import axios from 'axios';
import { BASEURL } from "../config";
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { useSelector} from 'react-redux';


const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
  }));

function SentiLabeling() {
  let history = useHistory();
  let { params } = useRouteMatch();
  let { articleId, idx } = params;
  let {articleTitle, paragraph} = params;

  const [tempPool, setTempPool] = useState([]);
  const [majorAspectPool, setMajorAspectPool] = useState([]);
  const [majorAspect, setMajorAspect] = useState("");
  const [minorAspect, setMinorAspect] = useState({offset:"", text:""});
  const [sentimentList, setSentimentList] = useState([]);
  const [totalAnswer, setTotalAnswer] = useState([]);

  const [aspectButtonCss, setAspectButtonCss] = useState({status:0, css:"aspect-label-button"});
  const [sentiButtonCss, setSentiButtonCss] = useState({status:0, css:"sentiment-label-button"});
  const [startId, setStartId] = useState(0);

  const profileObj = useSelector(state => state.profileObj);
  const [task, setTask] = useState();
  const maxParagraph = 10;

  const classes = useStyles();
  const taskInfo = JSON.parse(sessionStorage.getItem('paragraph'));

  useEffect(() => {
    const getSentiTask = async () => {
      let idNo = articleId.replace("articleId", "")
      let taskId = "taskId"+idNo+"-"+idx
      const arg = {
        articleId: articleId,
        taskId: taskId,
        taskType: "sentiment",
        userId: profileObj.googleId
      }
      // console.log("getSentiTask arg", arg)
      const res = await axios.post(`${BASEURL}/getSentiTask`, arg);
      // console.log('labeling: getSentiTask api', res);
      setTask(res.data);
      setTempPool(res.data.aspectPool);

    }
    getSentiTask();
  }, [articleId, idx, profileObj.googleId])

  const saveAnswer = async () => {
    let newAspectList = []
    let newSentiList = []
    let idNo = articleId.replace("articleId", "")
    let taskId = "taskId"+idNo+"-"+idx
    totalAnswer.map((oneAspect, idx) => {
      newAspectList = [...newAspectList, {
        taskId: taskId.toString(), 
        aspectId: oneAspect.id.toString(),
        offset: oneAspect.minorAspect.offset,
        majorAspect:oneAspect.majorAspect,
        minorAspect:oneAspect.minorAspect.text
      }]
      oneAspect.sentimentList.map((oneSenti, idx) =>{
        newSentiList = [...newSentiList,{
          taskId: taskId.toString(), 
          aspectId: oneAspect.id.toString(),
          offset: oneSenti.offset,
          sentiment: oneSenti.text,
          dir: oneSenti.dir
        }]
      })
    })
    // console.info(newAspectList);
    // console.info(newSentiList);
    let newAnswer = {aspect:newAspectList, sentiment:newSentiList}
    const res = await axios.post(`${BASEURL}/saveSentiAnswer`, newAnswer)
    console.log('sentiLabeling: saveAnswer api', res)
  }
  
  const chooseMajor = (major) => {
    setMajorAspect(major)
    // console.info(majorAspect);
  };

  const chooseNonMinor = () => {
    setMinorAspect({offset:-1,text:"[ 無 ]"})
    // console.info(majorAspect);
  };

  const changeDir = (offset) => {
    const newList = sentimentList.map((sentiment_item, idx) => {
      if (sentiment_item.offset === offset) {
        if(sentiment_item.dir === '+'){
          const updatedItem = {
            ...sentiment_item,
            dir: '-',
          };
          
          return updatedItem;
        }
        else if(sentiment_item.dir === '-'){
          const updatedItem = {
            ...sentiment_item,
            dir: '+',
          };
          // console.info(updatedItem)
          return updatedItem;
        }
        // console.info(sentiment_item)
        
      }
      return sentiment_item;
      // console.info(sentimentList)
    });
    // console.info(newList)
    setSentimentList(newList)
  }
  const deleteMinor = () => {
    setMinorAspect({offset:"",text:""})
    // console.info(majorAspect);
  };
  const deleteSenti = (offset) => {
    // console.info('delete!!');
    setSentimentList(sentimentList.filter( item => {
      return(item.offset !== offset)
    }))
    // console.info(majorAspect);
  };
  const deleteHistory = (id) => {
    // console.info('delete!!');
    setTotalAnswer(totalAnswer.filter( item => {
      return(item.id !== id)
    }))
    // console.info(majorAspect);
  };

  const renderMajor = () => {
    if (majorAspect !== ""){
        return(<div className="major-aspect-text">{majorAspect}</div>)
    }   
    // console.info(majorAspect);
  };

  const renderMinor = () => {
    if (majorAspect !== "" && minorAspect.text !== ""){
        return(<Chip label={minorAspect.text} onDelete={deleteMinor} variant="outlined"/>)
    }
  };

  const renderSenti = () => {
    if (sentimentList !== []){
        // console.info(sentimentList)
        return(
        <div className={classes.root}>
            {sentimentList.map((sentiment_item, idx) => {
              if(sentiment_item.dir === '+'){
                return(<Chip label={sentiment_item.text + ' [' + sentiment_item.dir+ ']'} color="primary" onClick={() => changeDir(sentiment_item.offset)} onDelete={() => deleteSenti(sentiment_item.offset)} variant="outlined"/>)
              }
              else if(sentiment_item.dir === '-'){
                return(<Chip label={sentiment_item.text + ' [' + sentiment_item.dir+ ']'} color="secondary" onClick={() => changeDir(sentiment_item.offset)} onDelete={() => deleteSenti(sentiment_item.offset)} variant="outlined"/>)
              }
              
            }
                
            )}
        </div>
        )
    }
  };

  const clickChooseMinor = () => {
    // console.info(aspectButtonCss);
    if (aspectButtonCss.status === 1){
        setAspectButtonCss({status:0, css:"aspect-label-button"});   
    }
    else if (aspectButtonCss.status === 0){
        setAspectButtonCss({status:1, css:"aspect-label-button-clicked"});   
        setSentiButtonCss({status:0, css:"sentiment-label-button"}); 
    } 
  };

  const clickChooseSenti = () => {
    // console.info(aspectButtonCss);
    if (sentiButtonCss.status === 1){
        setSentiButtonCss({status:0, css:"sentiment-label-button"});   
    }
    else if (sentiButtonCss.status === 0){
        setSentiButtonCss({status:1, css:"sentiment-label-button-clicked"});   
        setAspectButtonCss({status:0, css:"aspect-label-button"});
    } 
  };

  // subscribe to selection event
  const mouseUpHandler = event => {
    if (aspectButtonCss.status === 1){
        event.stopPropagation();
        var selObj = window.getSelection();
        var selRange = selObj.getRangeAt(0);
        setMinorAspect({offset:selRange.startOffset, text:selObj.toString()});
        return;
    }
    else if (sentiButtonCss.status === 1){
        event.stopPropagation();
        var selObj = window.getSelection();
        var selRange = selObj.getRangeAt(0);
        setSentimentList([...sentimentList, {offset:selRange.startOffset, text:selObj.toString(), dir:'+'}]);
        // console.info(sentimentList)
        return;
    }
    else{
        return
    }
  };
  const resetAnswer = (isLast) => {
    if(totalAnswer.length !== 0){
      saveAnswer();
      setTotalAnswer([]);
      setMajorAspect("");
      setMinorAspect({offset:"", text:""});
      setSentimentList([]);
      setAspectButtonCss({status:0, css:"aspect-label-button"});
      setSentiButtonCss({status:0, css:"sentiment-label-button"});
      setStartId(0);
      if(isLast === 1){
        history.push(`/Sentimental/Label/${articleId}/${parseInt(idx) + 1}`);
      }
    }
    else{
      alert('提醒：您並未標注任何情感字詞喔！')
      setTotalAnswer([]);
      setMajorAspect("");
      setMinorAspect({offset:"", text:""});
      setSentimentList([]);
      setAspectButtonCss({status:0, css:"aspect-label-button"});
      setSentiButtonCss({status:0, css:"sentiment-label-button"});
      setStartId(0);
      if(isLast === 1){
        history.push(`/Sentimental/Label/${articleId}/${parseInt(idx) + 1}`);
      }

    }
    
    
  }
  const saveOneSet = () => {
    if((majorAspect !== "") && (minorAspect.offset !== "") && (sentimentList.length !== 0)){
      setTotalAnswer([...totalAnswer, {id:startId, majorAspect:majorAspect, minorAspect:minorAspect, sentimentList:sentimentList}])
      setMajorAspect("");
      setMinorAspect({offset:"", text:""});
      setSentimentList([]);
      setAspectButtonCss({status:0, css:"aspect-label-button"});
      setSentiButtonCss({status:0, css:"sentiment-label-button"});
      setStartId(startId+1);

      // console.info(totalAnswer);
    }
    else{
      alert("請選取完整的 aspect 與 sentiment 組合，再完成送出！");
    }

    return;
  }

  return (
    <div id="SentiLabeling" className="justify-center">
      <div className="senti-working-area-container overflow-scroll">
        <div className="senti-back-button" onClick={() => history.push(`/Sentimental/Label/${articleId}`)}>〈 回上一層 </div>
        <div className="senti-working-article-title body-padding">{task ? task.taskTitle : ""}</div>
        <div className="senti-working-article-content body-padding" onMouseUp={mouseUpHandler}>{task ? task.context : ""}</div>
        
        {/* aspectPool */}
        <div className="justify-start mb-30 body-padding">
            <div className="pool-title justify-start" > 選擇想要標註的 Aspect Group： </div>
        </div>
        <div className={classes.root}>
            {/* {console.info(task ? task.aspectPool : "")} */}
            
            {tempPool.map((majorAspect, idx) => (
                <Chip label={majorAspect} onClick={() => chooseMajor(majorAspect)} variant="outlined"/>
            ))}
        </div>
        <div style={{"margin-top" : "50px"}}></div>
        
        {/* majorAspect and minorAspect*/}
        <div className="justify-start mb-30 body-padding">
            <div className="nowrap mr-10">標註 Aspect：</div>
                    
            <div className="senti-working-textarea justify-start">
                {renderMajor()}
                {renderMinor()}
            </div>
        
            <div>
                <div className="nonaspect-label-button " onClick = {() => chooseNonMinor()} > 劃記為 [ 無 ] </div>
                <div className={aspectButtonCss.css} onClick={() => clickChooseMinor()} > 劃記 aspect </div>
            </div>
        </div>
        
        {/* sentiment labeling*/}
        <div className="justify-start body-padding">
          <div className="nowrap mr-10">標記 Sentiment：</div>
          {/* <div 
          className="senti-working-textarea" 
          value={answer}
          onChange={()=>{return}}
          placeholder="請透過滑鼠反白方式選擇文章中的答案"/> */}
          <div className="senti-working-textarea justify-start">
            {renderSenti()}
          </div>
          <div>
            <div className={sentiButtonCss.css} onClick={clickChooseSenti}> 劃記情緒詞 </div>
          </div>
          
        </div>

        {/* 底部按鈕 */}
        <div className="justify-center">
          <div className="function-button-senti mr-40" onClick={saveOneSet}>新增 aspect</div>
          {/* {(paragraph <= maxParagraph) ? 
            (<Link to={`/MRC/Label/${articleTitle}/${parseInt(paragraph)+1}`}>
              <div className="function-button">下一段</div>
            </Link>):null} */}
      </div>
      </div>

      {/* 右側資料 */}
      <div className="senti-question-history-container align-start">
        <div className="justify-center senti-question-title">已標記內容</div>
        <div className="overflow-scroll">
          {totalAnswer.map((answerItem, idx) => (
            <div key={idx} onClick={() => deleteHistory(answerItem.id)} className="mb-15 single-aspect-block">
              <li> [{answerItem.majorAspect}]：{answerItem.minorAspect.text}</li>
              <ol>
                {answerItem.sentimentList.map((sentiment, idx) => (
                  <li>{sentiment.text+' ['+sentiment.dir+']'}</li>  
                ))}
              </ol>
              
            </div>
          ))}
        </div>
        
        {(idx < taskInfo.totalTaskNum-1) &&
          <div onClick = {() => resetAnswer(1)} className="finish-button">標註完成，前往下一段</div>
        }
        {(idx == taskInfo.totalTaskNum-1) &&
          <div onClick = {() => resetAnswer(0)} className="finish-button">標註完成</div>
        }
        {/* {(paragraph <= maxParagraph) ? 
            (<Link to={`/Sentimental/Label/${articleTitle}/${parseInt(paragraph)+1}`}>
              <div onClick = {() => resetAnswer()} className="finish-button">標註完成，前往下一段</div>
            </Link>):null} */}
      </div>
    </div>
  )
}

export default SentiLabeling;