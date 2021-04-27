import "./ValidationPage.css";
import "./Labeling.css";
import { BASEURL } from "../config";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

function ValidationPage() {
  const [taskInfo, setTaskInfo] = useState("");
  const profileObj = useSelector((state) => state.profileObj);
  const [answer, setAnswer] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [isFixedAnswer, setIsFixedAnswer] = useState(false);

  const getTask = async () => {
    const arg = {
      userId: profileObj.googleId,
      taskType: "MRCValidation",
    };
    const res = await axios.post(`${BASEURL}/getValidation`, arg);
    console.log("res", res);
    setTaskInfo(res.data);
    setArticleId(res.data.articleId);
  };

  useEffect(() => {
    getTask();
  }, [profileObj.googleId]);

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
  const saveAnswer = async () => {
    let newValidation = {
      userId: profileObj.googleId.toString(),
      originalId: taskInfo.originalId.toString(),
      validationAnswer: answer,
      startIdx: startIndex.toString(),
    };
    console.log("validationAnswer", newValidation);
    const res = await axios.post(`${BASEURL}/saveValidation`, newValidation);
    console.log("labeling: saveAnswer api", res);
    window.location.reload(false);
  };

  return (
    <div id="validation" className="justify-center">
      {taskInfo ? (
        <div className="working-area-container overflow-scroll validation-working-area">
          <div className="working-article-title body-padding">
            {taskInfo.taskTitle}
          </div>
          <div
            className="working-article-content body-padding"
            onMouseUp={mouseUpHandler}
          >
            {taskInfo.taskContext}
          </div>
          <div className="justify-start mb-30 body-padding">
            <div className="nowrap mr-10">問題：</div>
            {taskInfo.question}
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
          </div>
          <div className="justify-center">
            {answer && (
              <div onClick={() => saveAnswer()}>
                <div className="function-button">完成</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <h3 className="no-validation-remind">
          沒有要驗證的題目囉！請繼續標記！
        </h3>
      )}
    </div>
  );
}

export default ValidationPage;
