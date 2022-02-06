import { Link, useParams, useRouteMatch, useHistory } from "react-router-dom";
import './SentiLabeling.css'
import { fakeAspectDB } from './fakeData'
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import {useEffect, useState} from 'react';
import axios from 'axios';
import { BASEURL } from "../config";
import { makeStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import { useSelector} from 'react-redux';
import { CropLandscapeOutlined } from "@material-ui/icons";


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
  let { projectId } = useParams();

  const [aspectList, setAspectList] = useState([]);
  const [chosenAspect, setChosenAspect] = useState("");
  const [sentimentDict, setSentimentDict] = useState([]);
  const [isTaskSet, setIsTaskSet] = useState(false);
  const [sentimentList, setSentimentList] = useState([]);
  // const [totalAnswer, setTotalAnswer] = useState([]);

  const [sentiButtonCss, setSentiButtonCss] = useState({status:0, css:"sentiment-label-button"});
  const [startId, setStartId] = useState(0);

  const profileObj = useSelector(state => state.accountReducer.profileObj);
  const [task, setTask] = useState({taskId:"0", taskType:"0"});
  const maxParagraph = 10;

  const classes = useStyles();
  const taskInfo = JSON.parse(sessionStorage.getItem('paragraph'));

  useEffect(() => {
    const getSentiTask = async () => {
      const arg = {
        taskType: "sentiment",
        projectId:focusProject.projectId
      }
      // console.log("getSentiTask arg", arg)
      const res = await axios.post(`${BASEURL}/getSentiValidation`, arg);
      // console.log('labeling: getSentiTask api', res);
      setTask(res.data);
      setIsTaskSet(true);
      // console.log('now task is: ', res.data);
    }
    
    getSentiTask();
    
    
    // console.log(focusProject);
    
  }, [articleId, idx, profileObj.googleId])

  useEffect(() => {
    const getSentiAspectByTask = async () => {
      // let idNo = articleId.replace("articleId", "")
      // let taskId = "taskId"+idNo+"-"+idx
      const arg = {
        _id: task.taskId,
        taskType: "sentiment",
        userId: profileObj.googleId
      }

      // console.log("getSentiTask arg", arg)
      
      const res = await axios.post(`${BASEURL}/getSentiAspects`, arg);
      setAspectList(res.data);
      
      let tempDict = []
      if(sentimentDict.length === 0){
        // console.log("有再組裝", aspectList)
        res.data.map((aspectItem, idx) => {
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
    // if(task.taskId !== "0" && task.taskId){
    console.log("setIsTaskSet", isTaskSet)
    if(isTaskSet === true && task.taskId !== "0" && task.taskId){
      getSentiAspectByTask();
      setIsTaskSet(false);
    }
  },[articleId, idx, profileObj.googleId, aspectList, isTaskSet])
  
    /*======== hightlight functions =============*/
    const highlightText = (text, matched_substring, start, end) => {
      const highlightTextStart = matched_substring.offset;
      const highlightTextEnd = highlightTextStart + matched_substring.length;
  
      // The part before matched text
      const beforeText = text.slice(start, highlightTextStart);
  
      // Matched text
      const highlightedText = text.slice(highlightTextStart, highlightTextEnd);
  
      // Part after matched text
      // Till the end of text, or till next matched text
      const afterText = text.slice(highlightTextEnd, text.length);
  
      // Return in array of JSX elements
      return [
        beforeText,
        <Tooltip title="這是你之前已標註過的文字">
          <span className="underline">{highlightedText}</span>
        </Tooltip>,
        afterText,
      ];
    };
  
    const highlight = (text, matched_substrings) => {
      const returnText = [];
      if(matched_substrings == ""){
        var matched_substring = { offset: 0, length: 0 }
      }
      else if(matched_substrings.offset == -1){
        var matched_substring = { offset: 0, length: 0 }
      }
      else{
        console.info("生成match substring: ", matched_substrings.offset, matched_substrings.aspect )
        var matched_substring = { offset:matched_substrings.offset, length:matched_substrings.minorAspect.length}
      }
      const startOfNext = matched_substring.offset;
      console.info("highlight Text", text, matched_substrings, matched_substring, startOfNext)
      returnText.push(
        highlightText(
          text,
          matched_substring,
          0,
          startOfNext
        )
      );
        
  
      // Just iterate through all matches
      // for (let i = 0; i < matched_substrings.length; i++) {
      //   const startOfNext = matched_substrings[i + 1]?.offset;
      //   if (i === 0) {
      //     // If its first match, we start from first character => start at index 0
      //     returnText.push(
      //       highlightText(text, matched_substrings[i], 0, startOfNext)
      //     );
      //   } else {
      //     // If its not first match, we start from match.offset
      //     returnText.push(
      //       highlightText(
      //         text,
      //         matched_substrings[i],
      //         matched_substrings[i].offset,
      //         startOfNext
      //       )
      //     );
      //   }
      // }
  
      return returnText.map((text, i) => (
        <React.Fragment key={i}>{text}</React.Fragment>
      ));
    };

  const sendValidation = async () => {
    // let newAspectList = []
    let newSentiList = []
    // let idNo = articleId.replace("articleId", "")
    // let taskId = "taskId"+idNo+"-"+idx
    sentimentDict.map((oneAspect, idx) => {
      oneAspect.sentimentList.map((oneSenti, idx) =>{
        newSentiList = [...newSentiList,{
          taskId: task.taskId,
          aspectId: oneAspect.aspectId, 
          offset: oneSenti.offset,
          sentiment: oneSenti.text,
          dir: oneSenti.dir
        }]
      })
    })
    // console.info(newAspectList);
    // console.info(newSentiList);
    let new_task = {
      aspectPool:task.aspectPool,
      context:task.context,
      articleId:task.articleId,
      isAnswered:task.isAnswered,
      projectId:focusProject.projectId,
      _id:task.taskId,
      taskTitle:task.taskTitle,
      taskType:task.taskType,

    }
    let newAnswer = {task:new_task, aspect:aspectList, sentiment:newSentiList, projectId:focusProject.projectId}

    console.log("newAnswer : ",newAnswer);
    const res = await axios.post(`${BASEURL}/postSentiValidation`, newAnswer)
    // console.log('sentiLabeling: postSentiValidation api', res)
  }
  const discardAnswer = async () => {
    let query = {_id:task.taskId}
    console.log('senti valid: discard api', query)
    const res = await axios.post(`${BASEURL}/discardSentiAnswer`, query)
    console.log('senti valid: discard api', res)
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
  const resetAnswer = async(isLast) => {
    if(sentimentList.length !== 0){  
      
      if(isLast === 1){
        // saveAnswer();
        await sendValidation();
        setSentimentList([]);
        setSentimentDict([])
        setSentiButtonCss({status:0, css:"sentiment-label-button"});
        setStartId(0);
        history.push(`/sentiment/Validation}`);
      }
      else{
        // saveAnswer();
        await discardAnswer();
        setSentimentList([]);
        setSentimentDict([])
        setSentiButtonCss({status:0, css:"sentiment-label-button"});
        setStartId(0);
        history.push(`/sentiment/Validation}`);
      }
    }
    else{
      if(isLast === 1){
        alert('提醒：您並未標注任何情感字詞喔！')
        setSentiButtonCss({status:0, css:"sentiment-label-button"});
        setStartId(0);
        // if(isLast === 1){
        //   history.push(`/Sentimental/Label/${articleId}/${parseInt(idx) + 1}`);
        // }
      }
      else{
        // saveAnswer();
        discardAnswer();
        setSentimentList([]);
        setSentimentDict([])
        setSentiButtonCss({status:0, css:"sentiment-label-button"});
        setStartId(0);
        history.push(`/sentiment/Validation}`);
      }


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
        <div className="senti-working-article-content body-padding" onMouseUp={mouseUpHandler}>{task.taskId!=="0" ? highlight(task.context, chosenAspect) : ""}</div>
        {/* <div className="senti-working-article-content body-padding" onMouseUp={mouseUpHandler}>{task ? task.context: ""}</div> */}
        
        
        
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
        
        <div onClick = {() => resetAnswer(1)} className="finish-button">標註完成，前往下一段</div>
        {/* {(idx < taskInfo.totalTaskNum-1) &&
          <div onClick = {() => resetAnswer(1)} className="finish-button">標註完成，前往下一段</div>
        }
        {(idx == taskInfo.totalTaskNum-1) &&
          <div onClick = {() => (0)} className="finish-button">標註完成</div>
        } */}
        {/* {(paragraph <= maxParagraph) ? 
            (<Link to={`/Sentimental/Label/${articleTitle}/${parseInt(paragraph)+1}`}>
              <div onClick = {() => resetAnswer()} className="finish-button">標註完成，前往下一段</div>
            </Link>):null} */}
      </div>
    </div>
  )
}

export default SentiValid;