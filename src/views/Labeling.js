import { useRouteMatch, useHistory, useParams } from "react-router-dom";
import "./Labeling.css";
import { useEffect, useState } from "react";
import React from "react";
import { MRC_BASEURL } from "../config";
import axios from "axios";
import { useSelector } from "react-redux";
import Tooltip from "@material-ui/core/Tooltip";

function Labeling() {
  let history = useHistory();
  let { params } = useRouteMatch();
  let { projectId, articleId, idx } = params;
  let { idx: taskId } = useParams();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [isFixedAnswer, setIsFixedAnswer] = useState(false);
  // const [labelButtonCss, setLabelButtonCss] = useState("label-button justify-center nowrap");
  // const [buttonString, setButtonString] = useState("標記答案");
  // const taskInfo = JSON.parse(sessionStorage.getItem('paragraph'));
  const [task, setTask] = useState();
  const [qaPairs, setQaPairs] = useState();
  const profileObj = useSelector((state) => state.accountReducer.profileObj);
  const userId = useSelector((state) => state.accountReducer.userId);

  // [Todos] use api to get matched_substring
  var matched_substring = [
    { offset: 0, length: 10 },
    { offset: 20, length: 5 },
  ];
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
    const afterText = text.slice(highlightTextEnd, end || text.length);

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

    // Just iterate through all matches
    for (let i = 0; i < matched_substrings.length; i++) {
      const startOfNext = matched_substrings[i + 1]?.offset;
      if (i === 0) {
        // If its first match, we start from first character => start at index 0
        returnText.push(
          highlightText(text, matched_substrings[i], 0, startOfNext)
        );
      } else {
        // If its not first match, we start from match.offset
        returnText.push(
          highlightText(
            text,
            matched_substrings[i],
            matched_substrings[i].offset,
            startOfNext
          )
        );
      }
    }

    return returnText.map((text, i) => (
      <React.Fragment key={i}>{text}</React.Fragment>
    ));
  };
  /*======== hightlight functions =============*/

  useEffect(() => {
    const getTask = async () => {
      let idNo = articleId.replace("articleId", "");
      // let taskId = "taskId" + idNo + "-" + idx;
      // const arg = {
      //   articleId: articleId,
      //   taskId: taskId,
      //   taskType: "MRC",
      //   userId: profileObj.googleId,
      // };
      // console.log("getTask arg", arg);
      const res = await axios.get(`${MRC_BASEURL}/task`, {
        params: {
          taskId: taskId,
        },
      });
      setTask(res.data);
      const answers = await axios.get(`${MRC_BASEURL}/answers`, {
        params: {
          taskId: taskId,
          userId: userId,
        },
      });
      const reversedQa = answers.data ? answers.data.reverse() : [];
      setQaPairs(reversedQa);
    };
    getTask();
  }, [articleId, idx, profileObj.googleId]);

  // useEffect(() => {
  //   if (isFixedAnswer) {
  //     setLabelButtonCss("label-button justify-center nowrap light-green")
  //     setButtonString("重新標記")
  //   }
  //   else {
  //     setLabelButtonCss("label-button justify-center nowrap")
  //     setButtonString("標記答案")
  //   }
  // }, [isFixedAnswer]);

  // subscribe to selection event
  const mouseUpHandler = (event) => {
    if (isFixedAnswer) {
      return;
    }
    event.stopPropagation();
    var selObj = window.getSelection();
    setAnswer(selObj.toString());
    var selRange = selObj.getRangeAt(0);
    setStartIndex(selRange.startOffset);
    return;
  };

  // textarea to be editable
  const handleTextAreaChange = (event) => {
    setQuestion(event.target.value);
    return;
  };

  // handle selection answers fixed
  // const handleAnswerFixed = () => {
  //   if (answer === "") {
  //     alert("請以反白方式選擇內文再點選完成標註");
  //     return
  //   }

  //   setIsFixedAnswer(!isFixedAnswer)
  // }

  const saveAnswer = async () => {
    let newAnswer = {
      userId: userId,
      taskId: taskId,
      question: question,
      answer: answer,
      startIdx: startIndex,
    };
    const res = await axios.post(`${MRC_BASEURL}/answer`, newAnswer);
    console.log("labeling: saveAnswer api", res);
  };

  const handleNewQuestion = () => {
    if (!question || !answer) {
      return;
    }
    //[TODO]: post data
    let args = {
      question: question,
      answerString: answer,
      answerStart: startIndex,
    };
    console.log(args);

    // re-init answers and questions
    saveAnswer();
    qaPairs.unshift({ question: question, answer: answer });
    setQaPairs(qaPairs);
    setAnswer("");
    setStartIndex(0);
    setQuestion("");
    setIsFixedAnswer(false);
  };

  const goToNextTask = () => {
    handleNewQuestion();
    history.push(`/MRC/Label/${projectId}/${articleId}/${parseInt(idx) + 1}`);
  };

  return (
    <div id="Labeling" className="justify-center">
      <div className="working-area-container overflow-scroll">
        <div
          className="back-button"
          onClick={() => history.push(`/MRC/Label/${projectId}/${articleId}`)}
        >
          〈 回上一層{" "}
        </div>
        <div className="working-article-title body-padding">
          {task ? task.title.slice(0, 50) + "..." : ""}
        </div>
        <div
          className="working-article-content body-padding"
          onMouseUp={mouseUpHandler}
        >
          {task ? highlight(task.content, matched_substring) : ""}
        </div>
        <div className="justify-start mb-30 body-padding">
          <div className="nowrap mr-10">問題：</div>
          <textarea
            className="working-textarea"
            value={question}
            onChange={handleTextAreaChange}
          />
        </div>
        <div className="justify-start body-padding">
          <div className="nowrap mr-10">答案：</div>
          <textarea
            className="working-textarea"
            value={answer}
            onChange={() => {
              return;
            }}
            placeholder="請透過滑鼠反白方式選擇文章中的答案"
          />
          {/* <div className={labelButtonCss} onClick={handleAnswerFixed}>{buttonString}</div> */}
        </div>
        <div className="justify-center">
          {question && answer && (
            <div className="function-button mr-40" onClick={handleNewQuestion}>
              新增題目
            </div>
          )}
          {/* {idx < taskInfo.totalTaskNum - 1 && (
            <div onClick={() => goToNextTask()}>
              <div className="function-button">下一段</div>
            </div>
          )} */}
        </div>
      </div>
      <div className="question-history-container align-start">
        <div className="justify-center question-title">提問紀錄</div>
        <div className="overflow-scroll history-card-container">
          {qaPairs
            ? qaPairs.reverse().map((qaPairs, idx) => (
                <div key={idx} className="history-card mb-15">
                  <div className="mb-5">問：{qaPairs.question}</div>
                </div>
              ))
            : ""}
        </div>
      </div>
    </div>
  );
}

export default Labeling;
