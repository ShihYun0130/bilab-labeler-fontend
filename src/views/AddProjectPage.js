import "./ParagraphCards.css";
import "./ProjectManagePage.css";
import "./Labeling.css";
import "react-responsive-modal/styles.css";
import Select from "react-select";
import DescriptionRoundedIcon from "@material-ui/icons/DescriptionRounded";
import CloseRoundedIcon from "@material-ui/icons/CloseRounded";
import { MRC_BASEURL } from "../config";
import { useState, useEffect } from "react";
import axios from "axios";
import csv from "csv";
import Dropzone from "react-dropzone";
import { useSelector } from "react-redux";
import { Modal } from "react-responsive-modal";

function AddProjectPage(props) {
  const profileObj = useSelector((state) => state.accountReducer.profileObj);

  const defaultAddProjectObj = {
    projectName: "康健雜誌 MRC",
    projectType: "MRC",
    projectId: 1,
    labelInfo: `請依循標註注意事項進行標註:\n• 請在標記答案的時候選擇最接近問題的答案(也就是跟問題本身最有關連的答案)\n• 請標記出最短可行的答案作為原則，不須包含任何前綴詞，結尾也不需要包含句號等標點符號\n• 請參考作答區域右方的提問紀錄，盡量不要重覆到他人問過的問題`,
  };

  const defaultFileObj = {
    fileName: "",
    fileSize: 0,
  };

  const typeOptions = [
    { value: "MRC", label: "MRC" },
    { value: "Sentiment", label: "Sentiment" },
  ];
  const [users, setUsers] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectType, setProjectType] = useState(typeOptions[0]);
  const [labelInfo, setLabelInfo] = useState(defaultAddProjectObj.labelInfo);
  const [admins, setAdmins] = useState([
    {
      value: profileObj.googleId,
      label: profileObj.name + " - " + profileObj.email,
    },
  ]);
  const [workers, setWorkers] = useState([]);
  const [fileObj, setFileObj] = useState(defaultFileObj);
  const [csvFile, setCsvFile] = useState([]);
  const [openDeleteWarn, setOpenDeleteWarn] = useState(false);

  // initialize
  useEffect(() => {
    const getUsers = async () => {
      const res = await axios.get(`${MRC_BASEURL}/users`);
      setUsers(
        res.data.map((projectUser) => {
          return {
            value: projectUser.userId,
            label: projectUser.name + " - " + projectUser.email,
          };
        })
      );
    };

    // get users in the project and set list.
    const getProjectUsers = async (projectId) => {
      let arg = {
        projectId: String(projectId),
      };
      const res = await axios.get(`${MRC_BASEURL}/projectUsers`, arg);
      console.log("projectUser", res.data);
      if (res.data && res.data.length > 0) {
        var tempWorkers = [];
        let tempAdmins = [];
        res.data.forEach((projectUser) => {
          if (projectUser.statusCode == "1") {
            tempAdmins.push({
              value: projectUser._id,
              label: projectUser.name + " - " + projectUser.email,
            });
          } else {
            tempWorkers.push({
              value: projectUser._id,
              label: projectUser.name + " - " + projectUser.email,
            });
          }
        });
        setAdmins([...tempAdmins]);
        setWorkers([...tempWorkers]);
        // console.log("[debug]: tempAdmins", admins);
        // console.log("[debug]: tempWorkers", workers);
      }
    };

    if (props.isEdit) {
      // import data from focus project
      let targetProject = props.project;
      setProjectName(targetProject.name);
      setProjectType({
        label: targetProject.type,
        value: targetProject.type,
      });
      setLabelInfo(targetProject.rule);
      getProjectUsers(targetProject._id);
    }
    getUsers();
  }, []);

  //check if memebers has at least one projectOwner
  const checkExistProjectOwner = () => {
    if (admins.length) {
      return true;
    }
    return false;
  };

  const saveProject = async () => {
    console.log("[debug] projectType:", projectType);
    console.log("[debug] admins:", admins);
    console.log("[debug] workers:", workers);
    if (!projectName) {
      alert("需要填寫專案名稱");
      return;
    }
    if (!labelInfo) {
      alert("需要填寫專案說明");
      return;
    }
    if (!props.isEdit && (!fileObj.fileName || !csvFile)) {
      alert("請確實上傳正確格式的檔案與檔案名稱");
      return;
    }
    if (props.isEdit && !checkExistProjectOwner()) {
      alert("請至少選取一位成員作為管理者");
      return;
    }
    let arg = {
      project: {
        projectName,
        projectType,
        labelInfo,
      },
      members: [...users], // insert both project owner and add members
      csvFile,
    };
    console.log(arg);
    let res = null;
    try {
      res = await axios.post(`${MRC_BASEURL}/project`, arg);
      console.log("res data", res);
      alert("儲存成功");
    } catch (err) {
      alert(err.response.data);
    }
    props.onCloseCallback();
  };

  // textarea to be editable
  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
    return;
  };

  const handleLabelInfoChange = (event) => {
    setLabelInfo(event.target.value);
    return;
  };

  //upload excel
  const onDrop = (e) => {
    console.log(e[0].name);
    if (e[0].name.indexOf(".csv") === -1) {
      alert("請輸入正確格式的csv檔案");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      csv.parse(reader.result, (err, data) => {
        setCsvFile(data);
      });
    };
    reader.readAsText(e[0]);
    let file = {
      fileName: e[0].name,
      fileSize: e[0].size / 1000000,
    };
    setFileObj(file);
  };

  const onCancelUpload = () => {
    setFileObj(defaultFileObj);
    setCsvFile([]);
  };

  const onDeleteProject = () => {
    onCloseDeleteWarnModal();
    props.onCloseCallback();
    return;
  };

  const onOpenDeleteWarnModal = () => {
    setOpenDeleteWarn(true);
  };
  const onCloseDeleteWarnModal = () => setOpenDeleteWarn(false);

  return (
    <div className="modal-container">
      <h2 className="modal-header">新增專案</h2>
      <div className="align-start body-padding ">
        <div className="nowrap mb-10">專案名稱：</div>
        <textarea
          className="form-textarea h20"
          onChange={handleProjectNameChange}
          value={projectName}
        />
      </div>
      <div className="align-start body-padding mt-20">
        <div className="nowrap mb-10">專案類別</div>
        <div className="w-150">
          <Select
            value={projectType}
            onChange={setProjectType}
            options={typeOptions}
          />
        </div>
      </div>
      <div className="align-start body-padding mt-20">
        <div className="nowrap mb-10">專案說明與需求：</div>
        <textarea
          className="form-textarea h80"
          value={labelInfo}
          onChange={handleLabelInfoChange}
        />
      </div>
      <div className="align-start body-padding mt-20">
        <div className="nowrap mb-10">專案角色：</div>
        <div className="role mb-5"> 管理者 </div>
        <div className="w-all mb-10">
          <Select
            value={admins}
            isMulti
            name="admin"
            options={users}
            onChange={setAdmins}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
        <div className="role mb-5"> 標註者 </div>
        <div className="w-all">
          <Select
            value={workers}
            isMulti
            name="worker"
            options={users}
            onChange={setWorkers}
            className="basic-multi-select"
            classNamePrefix="select"
          />
        </div>
      </div>
      <div className="align-start body-padding mt-20">
        <div className="nowrap mb-10">上傳檔案：</div>
        {fileObj.fileName !== "" ? (
          <div className="justify-center file-display" onClick={onCancelUpload}>
            <div className="flex-wrap mr-5">
              <DescriptionRoundedIcon fontSize="small" />
            </div>
            <p>
              {fileObj.fileName}{" "}
              <span className="text-normal ml-10">
                {fileObj.fileSize.toFixed(2)} MB
              </span>
            </p>
            <div className="flex-wrap ml-10">
              <CloseRoundedIcon fontSize="small" />
            </div>
          </div>
        ) : (
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <section className="w-all">
                <div {...getRootProps()} className="dropZone center-center">
                  <input {...getInputProps()} accept=".csv" />
                  <p>拖曳或點擊檔案以上傳</p>
                </div>
              </section>
            )}
          </Dropzone>
        )}
      </div>
      <div className="justify-end mt-20">
        {props.isEdit ? (
          <div
            className="delete-btn center-center"
            onClick={onOpenDeleteWarnModal}
          >
            刪除專案
          </div>
        ) : (
          ""
        )}
        <div className="save-btn center-center ml-20" onClick={saveProject}>
          儲存
        </div>
      </div>
      <Modal open={openDeleteWarn} onClose={onCloseDeleteWarnModal} center>
        <div className="modal-container">
          <h2 className="modal-header">確定要刪除專案嗎？</h2>
          <p className="body-padding">
            刪除專案將會連同曾經上傳的紀錄與標註內容一併刪除
          </p>
          <div className="justify-around">
            <div
              className="save-btn center-center ml-20"
              onClick={onCloseDeleteWarnModal}
            >
              取消
            </div>
            <div
              className="delete-btn center-center ml-20"
              onClick={onDeleteProject}
            >
              確認刪除專案
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AddProjectPage;
