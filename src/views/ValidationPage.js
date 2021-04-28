import "./ValidationPage.css";
import "./Labeling.css";
import { BASEURL } from "../config";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import axios from "axios";

function ValidationPage() {
  const [taskInfo, setTaskInfo] = useState("");
  const [decisionInfo, setDecisionInfo] = useState("");
  const profileObj = useSelector((state) => state.profileObj);
  const [answer, setAnswer] = useState("");
  const [startIndex, setStartIndex] = useState(0);
  const [isFixedAnswer, setIsFixedAnswer] = useState(false);

  const [value, setValue] = useState("");

  const handleChange = (event) => {
    console.log("value", event.target.value);
    setValue(event.target.value);
  };

  const getDecision = async () => {
    const arg = {
      userId: profileObj.googleId,
    };
    const res = await axios.post(`${BASEURL}/getDecision`, arg);
    // console.log("res", res);
    setDecisionInfo(res.data);
  };
  useEffect(() => {
    getDecision();
  }, [profileObj.googleId]);

  const getTask = async () => {
    const arg = {
      userId: profileObj.googleId,
      taskType: "MRCValidation",
    };
    const res = await axios.post(`${BASEURL}/getValidation`, arg);
    // console.log("res", res);
    setTaskInfo(res.data);
  };
  const saveDecision = async () => {
    let status = "failed";
    if (value === "original" || value === "validation") {
      status = "verified";
    }
    let newDecision = {
      userId: profileObj.googleId,
      originalId: decisionInfo.original,
      validationId: decisionInfo.validationId,
      validationStatusId: decisionInfo.validationStatusId,
      status: status,
      decisionResult: value,
    };
    // console.log("validationAnswer", newDecision);
    const res = await axios.post(`${BASEURL}/saveDecision`, newDecision);
    // console.log("labeling: saveDecision api", res);
    window.location.reload(false);
  };

  useEffect(() => {
    if (!decisionInfo.original) {
      getTask();
    }
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
    // console.log("validationAnswer", newValidation);
    const res = await axios.post(`${BASEURL}/saveValidation`, newValidation);
    // console.log("labeling: saveAnswer api", res);
    window.location.reload(false);
  };

  return (
    <div id="validation" className="justify-center">
      {decisionInfo ? (
        <div className="working-area-container overflow-scroll validation-working-area">
          <h3 className="working-article-title body-padding">
            請從下列文章與兩個標記答案中選擇較適合的答案，若無，請選擇放棄。
          </h3>
          <div className="working-article-content body-padding">
            {decisionInfo.originalTaskContext}
          </div>
          <FormControl className="form-control" component="fieldset">
            <RadioGroup
              aria-label="answer1"
              name="decision"
              value={value}
              onChange={handleChange}
              className="radio-group"
            >
              <FormControlLabel
                value="original"
                control={<Radio />}
                label={decisionInfo.originalAnswer}
              />
              <FormControlLabel
                value="validation"
                control={<Radio />}
                label={decisionInfo.validationAnswer}
              />
              <FormControlLabel
                value="other"
                control={<Radio />}
                label="放棄"
              />
            </RadioGroup>
          </FormControl>
          <div className="save-decision-container">
            {value && (
              <div onClick={() => saveDecision()}>
                <div className="function-button save-decision-button">確定</div>
              </div>
            )}
          </div>
        </div>
      ) : taskInfo.taskTitle ? (
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
