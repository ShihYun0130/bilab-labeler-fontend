import './ValidationPage.css';
import './Labeling.css';
import { MRC_BASEURL } from '../config';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from 'react-loader-spinner';

function ValidationPage() {
  const [task, setTask] = useState();
  const userId = useSelector((state) => state.accountReducer.userId);
  const [isFixedAnswer, setIsFixedAnswer] = useState(false);
  const [answer, setAnswer] = useState('');
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const getTask = async () => {
      const res = await axios.get(`${MRC_BASEURL}/validation`, {
        params: { userId: userId },
      });
      setTask(res.data);
    };
    getTask();
  }, [userId]);

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

  const saveValidation = async () => {
    const validationData = {
      userId: userId,
      answerId: task._id,
      validationAnswer: answer,
      validationStartIdx: startIndex,
    };
    const res = await axios.post(`${MRC_BASEURL}/validation`, validationData);
    console.log('validation result', res);
    window.location.reload();
    return;
  };

  if (!task) {
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
    <div id="validation" className="justify-center">
      <div className="working-area-container overflow-scroll validation-working-area">
        <div className="working-article-title body-padding">{task.title}</div>
        <div
          className="working-article-content body-padding"
          onMouseUp={mouseUpHandler}
        >
          {task ? task.taskId.content : ''}
        </div>
        <div className="justify-start mb-30 body-padding">
          <div className="nowrap mr-10">問題：</div>
          {task.question}
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
          <div onClick={() => saveValidation()}>
            <div className="function-button">完成</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValidationPage;
