import { Link, useRouteMatch, useHistory } from "react-router-dom";
import './SentiLabeling.css'
import { fakeAspectDB } from './fakeData'
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



function SentiValid() {
  let history = useHistory();
  let { params } = useRouteMatch();
  let { articleId, idx } = params;
  const focusProject = useSelector(state => state.projectReducer.focusProject);


  const [aspectList, setAspectList] = useState([]);
  const [chosenAspect, setChosenAspect] = useState("");
  const [sentimentDict, setSentimentDict] = useState([]);

  const [sentimentList, setSentimentList] = useState([]);
  // const [totalAnswer, setTotalAnswer] = useState([]);

  const [sentiButtonCss, setSentiButtonCss] = useState({status:0, css:"sentiment-label-button"});
  const [startId, setStartId] = useState(0);

  const profileObj = useSelector(state => state.accountReducer.profileObj);
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
    }
    const getSentiAspectByTask = async () => {
      let idNo = articleId.replace("articleId", "")
      let taskId = "taskId"+idNo+"-"+idx
      const arg = {
        articleId: articleId,
        taskId: taskId,
        taskType: "sentiment",
        userId: profileObj.googleId
      }
      // console.log("getSentiTask arg", arg)
      // const res = await axios.post(`${BASEURL}/getSentiTask`, arg);
      const res = fakeAspectDB
      // console.log('labeling: getSentiAspect api', res);
      // setTask(res.data);
      setAspectList(res);
      let tempDict = []
      if(sentimentDict.length === 0){

        aspectList.map((aspectItem, idx) => {
          tempDict = [
            ...tempDict,
            {
              aspectId: aspectItem.aspectId,
              sentimentList:[]
            }
          ]
          //console.info(sentimentDict)
        })
        setSentimentDict(tempDict)
        // console.info(sentimentDict)
      }
      
    }
    getSentiTask();
    getSentiAspectByTask();
    // console.log(focusProject);
    
  }, [articleId, idx, profileObj.googleId, aspectList])
  
  const sendValidation = async () => {
    // let newAspectList = []
    let newSentiList = []
    let idNo = articleId.replace("articleId", "")
    let taskId = "taskId"+idNo+"-"+idx
    sentimentDict.map((oneAspect, idx) => {
      oneAspect.sentimentList.map((oneSenti, idx) =>{
        newSentiList = [...newSentiList,{
          taskId: taskId.toString(), 
          aspectId: oneAspect.aspectId.toString(), 
          offset: oneSenti.offset,
          sentiment: oneSenti.text,
          dir: oneSenti.dir
        }]
      })
    })
    // console.info(newAspectList);
    // console.info(newSentiList);
    
    let newAnswer = {task:task, aspect:aspectList, sentiment:newSentiList, projectId:focusProject.projectId.toString()}
    // console.log(newAnswer);
    const res = await axios.post(`${BASEURL}/postSentiValidation`, newAnswer)
    console.log('sentiLabeling: postSentiValidation api', res)
  }

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
  
  const deleteSenti = (offset) => {
    // console.info('delete!!');
    setSentimentList(sentimentList.filter( item => {
      return(item.offset !== offset)
    }))
    // console.info(majorAspect);
  };
  const chooseAspect = (aspectItem) => {
    setChosenAspect(aspectItem)
    setSentimentList(sentimentDict.filter( item => {
      return(item.aspectId === aspectItem.aspectId)
    })[0].sentimentList)
    // console.info(majorAspect);

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

  const renderValidSets = () => {
    return(
      <div> 
        <div className="justify-start mb-30 body-padding">
            <div className="nowrap mr-10"> Aspect：</div>
            <div className="senti-working-textarea justify-start">
              <div className="major-aspect-text">{chosenAspect ? chosenAspect.majorAspect : ""}</div>
              <Chip label={chosenAspect ? chosenAspect.minorAspect : ""}  variant="outlined"/>
            </div>
        </div>
        
        <div className="justify-start body-padding">
          <div className="nowrap mr-10">標記 Sentiment：</div>
          <div className="senti-working-textarea justify-start">
            {renderSenti()}
          </div>
          <div>
            <div className={sentiButtonCss.css} onClick={clickChooseSenti}> 劃記情緒詞 </div>
          </div>
        </div>
      </div>  
    )
  }

  const clickChooseSenti = () => {
    // console.info(aspectButtonCss);
    if (sentiButtonCss.status === 1){
        setSentiButtonCss({status:0, css:"sentiment-label-button"});   
    }
    else if (sentiButtonCss.status === 0){
        setSentiButtonCss({status:1, css:"sentiment-label-button-clicked"});   
        
    } 
  };

  // subscribe to selection event
  const mouseUpHandler = event => {
   
    if (sentiButtonCss.status === 1){
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
    if(sentimentList.length !== 0){  
      sendValidation();
      if(isLast === 1){
        // saveAnswer();
        setSentimentList([]);
        setSentimentDict([])
        setSentiButtonCss({status:0, css:"sentiment-label-button"});
        setStartId(0);
        history.push(`/Sentimental/Label/${articleId}/${parseInt(idx) + 1}`);
      }
      else{
        // saveAnswer();
        setSentimentList([]);
        setSentimentDict([])
        setSentiButtonCss({status:0, css:"sentiment-label-button"});
        setStartId(0);
        history.push(`/Sentimental/Label/${articleId}`);
      }
    }
    else{
      alert('提醒：您並未標注任何情感字詞喔！')
      setSentiButtonCss({status:0, css:"sentiment-label-button"});
      setStartId(0);
      // if(isLast === 1){
      //   history.push(`/Sentimental/Label/${articleId}/${parseInt(idx) + 1}`);
      // }

    }
    
    
  }
  const saveOneSet = () => {
    if((sentimentList.length !== 0)){
      let tempSentiItem = sentimentDict.filter(item => {return(item.aspectId !== chosenAspect.aspectId)})
      setSentimentDict([...tempSentiItem, {aspectId: chosenAspect.aspectId, sentimentList:sentimentList}])
      // setSentimentList([]);
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
        
        
        
        <div>
          {chosenAspect!=="" ? renderValidSets() : ""}
        </div>
        

        {/* 底部按鈕 */}
        <div className="justify-center">
          <div className="function-button-senti mr-40" onClick={saveOneSet}>提交該筆驗證</div>
          <div className="report-button-senti" onClick={() => resetAnswer(0)}>回報 Aspect 標記有誤</div>
        </div>
      </div>

      {/* 右側資料 */}
      <div className="senti-question-history-container align-start">
        <div className="justify-center senti-question-title">待驗證內容</div>
        <div className="justify-center senti-question-text">請在下方點擊要驗證的 aspect，並替該 aspect 完成 sentiment 的標注：</div>
        <div className="overflow-scroll">
          {aspectList.map((aspectItem, idx) => (
            <div key={idx} onClick={() => chooseAspect(aspectItem)} className="mb-15 single-aspect-block">
              <li> [{aspectItem.majorAspect}]：{aspectItem.minorAspect}</li>
                <ol>

                {
                  sentimentDict.filter(item => {return(aspectItem.aspectId === item.aspectId)}).length !== 0 ? sentimentDict.filter(item => {return(aspectItem.aspectId === item.aspectId)})[0].sentimentList.map((sentimentItem, idx) => (
                    <li>{sentimentItem.text+' ['+sentimentItem.dir+']'}</li>  
                  )) : ""
                }  
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

export default SentiValid;