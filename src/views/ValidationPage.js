import './ValidationPage.css';
import './Labeling.css';
import { MRC_BASEURL } from '../config';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from 'react-loader-spinner';
import {
  FormLabel,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
} from '@material-ui/core';
import { CompassCalibrationOutlined } from '@material-ui/icons';

function ValidationPage() {
  const [validation, setValidation] = useState();
  const [decision, setDecision] = useState();
  const userId = useSelector((state) => state.accountReducer.userId);
  const [isFixedAnswer, setIsFixedAnswer] = useState(false);
  const [validationAnswer, setValidationAnswer] = useState('');
  const [startIndex, setStartIndex] = useState(0);
  const [decisionResult, setDecisionResult] = useState('answer');

  const handleDecisionChange = (event) => {
    console.log(event.target.value);
    setDecisionResult(event.target.value);
  };

  useEffect(() => {
    // if there is decision data, render decision question,
    // if not, render validation question
    // if neither, render keep labeling message
    const getTask = async () => {
      const res = await axios.get(`${MRC_BASEURL}/decision`, {
        params: { userId: userId },
      });
      console.log('decision', res);
      setDecision(res.data);
      if (!res) {
        const vali = await axios.get(`${MRC_BASEURL}/validation`, {
          params: { userId: userId },
        });
        setValidation(vali.data);
      }
    };
    getTask();
  }, [userId]);

  const mouseUpHandler = (event) => {
    if (isFixedAnswer) {
      return;
    }
    event.stopPropagation();
    var selObj = window.getSelection();
    setValidationAnswer(selObj.toString());
    var selRange = selObj.getRangeAt(0);
    setStartIndex(selRange.startOffset);
    return;
  };

  const saveValidation = async () => {
    const validationData = {
      userId: userId,
      answerId: validation._id,
      validationAnswer: validationAnswer,
      validationStartIdx: startIndex,
    };
    const res = await axios.post(`${MRC_BASEURL}/validation`, validationData);
    console.log('validation result', res);
    window.location.reload();
    return;
  };

  const saveDecision = async () => {
    const decisionData = {
      userId: userId,
      answerId: decision.answerId._id,
      validationId: decision.validationId._id,
      decisionId: decision._id,
      decisionResult: decisionResult,
    };
    const res = await axios.post(`${MRC_BASEURL}/decision`, decisionData);
    console.log('decision result', res);
    window.location.reload();
    return;
  };

  return (
    <div id="validation" className="justify-center">
      {!decision && !validation ? (
        <div>沒有任何待驗證的題目，請繼續標注：）</div>
      ) : decision ? (
        <div className="working-area-container overflow-scroll validation-working-area">
          <div className="working-article-title body-padding">
            {decision.taskId.title}
          </div>
          <div
            className="working-article-content body-padding"
            onMouseUp={mouseUpHandler}
          >
            {decision.taskId.content}
          </div>
          <div className="justify-start mb-30 body-padding">
            <div className="nowrap mr-10">問題：</div>
            {decision.answerId.question}
          </div>
          <div className="justify-start mb-30 body-padding">
            <FormControl component="fieldset">
              <div class="radio-title">請選出下列較符合的答案：</div>
              <RadioGroup
                name="decision"
                value={decisionResult}
                onChange={handleDecisionChange}
              >
                <FormControlLabel
                  value="answer"
                  control={<Radio />}
                  label={decision.answerId.answer}
                />
                <FormControlLabel
                  value="validation"
                  control={<Radio />}
                  label={decision.validationId.validationAnswer}
                />
                <FormControlLabel
                  value="NOTA"
                  control={<Radio />}
                  label="以上皆非"
                />
              </RadioGroup>
            </FormControl>
          </div>
          <div className="justify-center">
            <div onClick={() => saveDecision()}>
              <div className="function-button">完成</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="working-area-container overflow-scroll validation-working-area">
          <div className="working-article-title body-padding">
            {validation.title}
          </div>
          <div
            className="working-article-content body-padding"
            onMouseUp={mouseUpHandler}
          >
            {validation ? validation.taskId.content : ''}
          </div>
          <div className="justify-start mb-30 body-padding">
            <div className="nowrap mr-10">問題：</div>
            {validation.question}
          </div>
          <div className="justify-start body-padding">
            <div className="nowrap mr-10">答案：</div>
            <textarea
              className="working-textarea"
              value={validationAnswer}
              onChange={() => {
                return;
              }}
              placeholder="請透過滑鼠反白方式選擇文章中的答案"
            />
          </div>
          <div className="justify-center">
            <div onClick={() => saveValidation()}>
              <div className="function-button">完成</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ValidationPage;
