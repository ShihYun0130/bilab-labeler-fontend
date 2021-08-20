import './ValidationPage.css';
import './Labeling.css';
import { MRC_BASEURL } from '../config';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function ValidationPage() {
  const [task, setTask] = useState();
  const userId = useSelector((state) => state.accountReducer.userId);

  useEffect(() => {
    const getTask = async () => {
      const res = await axios.get(`${MRC_BASEURL}/validation`, {
        params: { userId: userId },
      });
      setTask(res.data);
    };
    getTask();
  }, [userId]);
  return (
    <div id="validation" className="justify-center">
      <div className="working-area-container overflow-scroll validation-working-area">
        <div className="working-article-title body-padding">{task.title}</div>
        <div className="working-article-content body-padding">
          {task.taskId.content}
        </div>
        <div className="justify-start mb-30 body-padding">
          <div className="nowrap mr-10">問題：</div>
          {task.question}
        </div>
        <div className="justify-start body-padding">
          <div className="nowrap mr-10">答案：</div>
          <textarea
            className="working-textarea"
            placeholder="請透過滑鼠反白方式選擇文章中的答案"
          />
        </div>
        <div className="justify-center"></div>
      </div>
    </div>
  );
}

export default ValidationPage;
