import './ParagraphCards.css'
import './ProjectManagePage.css'
import './Labeling.css'
import 'react-responsive-modal/styles.css';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import DescriptionRoundedIcon from '@material-ui/icons/DescriptionRounded';
import AddCircleRoundedIcon from '@material-ui/icons/AddCircleRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { BASEURL } from "../config"
import { useState, useEffect } from "react"
import axios from 'axios'
import csv from "csv";
import Dropzone from 'react-dropzone'
import { useSelector} from 'react-redux'

function AddProjectPage(props) {
    const profileObj = useSelector(state => state.profileObj);

    var defaultAddProjectObj = {
        projectName:"康健雜誌 MRC",
        projectType:"MRC",
        projectId:1, 
        labelInfo:
          `請依循標註注意事項進行標註:\n• 請在標記答案的時候選擇最接近問題的答案(也就是跟問題本身最有關連的答案)\n• 請標記出最短可行的答案作為原則，不須包含任何前綴詞，結尾也不需要包含句號等標點符號\n• 請參考作答區域右方的提問紀錄，盡量不要重覆到他人問過的問題`,
    }
    var ownerMember = {
        userId:profileObj.googleId,
        codeType:'1',
        statusCode:'1',
    }
    var defaultMember = {
        userId:0,
        codeType:'1',
        statusCode:'2',
    }

    var defaultFileObj = {
        fileName:"",
        fileSize:0,
    }

    const [users, setUsers] = useState();
    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState("MRC");
    const [labelInfo, setLabelInfo] = useState(defaultAddProjectObj.labelInfo);
    const [members, setMembers] = useState([defaultMember]);
    const [selectedUserIds, setSelectedUserIds] = useState([profileObj.userId]);
    const [fileObj, setFileObj] = useState(defaultFileObj);
    const [csvFile, setCsvFile] = useState([]);

    // initialize
    useEffect(() => {
        const getUsers = async (project) => {
            let arg = {
                projectId: 0,
            }
            const res = await axios.post(`${BASEURL}/users`, arg);
            console.log("users", res.data.map(x => x.email));
            setUsers(res.data);
            let tempMembers = members;
            tempMembers[0].userId = res.data[0].userId
            setMembers([...tempMembers])
        };
        getUsers();
      }, [])

    // computed
    useEffect(() => {
        setSelectedUserIds(members.map(x => x.userId))
        console.log(selectedUserIds)
    }, [members])

    const saveProject = async() => {
        if(!projectName){
            alert("需要填寫專案名稱")
            return
        }
        if(!labelInfo){
            alert("需要填寫專案說明")
            return
        }
        if(!fileObj.fileName || !csvFile){
            alert("請確實上傳正確格式的檔案與檔案名稱")
            return
        }
        let arg = {
            project:
            {
                projectName,
                projectType,
                labelInfo
            },
            members:[...members, ownerMember], // insert both project owner and add members
            csvFile,
        }
        console.log(arg)
        let res = null
        try{
            res = await axios.post(`${BASEURL}/saveProject`, arg);
            console.log("res data", res)
            alert("儲存成功")
        } catch(err){
            alert(err.response.data);
        }
        props.onCloseCallback()
    }

    // textarea to be editable
    const handleProjectNameChange = event => {
        setProjectName(event.target.value);
        return;
    }
    const handleProjectType = event => {
        setProjectType(event.target.value);
        return;
    }
    const handleLabelInfoChange = event => {
        setLabelInfo(event.target.value);
        return;
    }
    
    // add member in add project
    const addMember = () => {
        let tempMembers = members;
        tempMembers.push({
            userId: members[0]? members[0].userId : "",
            codeType: '1',
            statusCode: '2',
        });
        setMembers([...tempMembers])
    }
    const handleSelectedUserChange = idx => (event) => {
        let tempMembers = [...members];
        tempMembers[idx].userId = event.target.value;
        setMembers([...tempMembers]);
        console.log(members);
    }
    const handleSelectedStatusCodeAdd = idx => (event) => {
        console.log(event.target.value);
        let tempMembers = [...members];
        tempMembers[idx].statusCode = event.target.value;
        setMembers([...tempMembers]);
    }

    //upload excel
    const onDrop = (e) => {
        console.log(e[0].name);
        if(e[0].name.indexOf(".csv") === -1){
            alert("請輸入正確格式的csv檔案")
            return
        }
        const reader = new FileReader();
        reader.onload = () => {
            csv.parse(reader.result,(err, data) => {
                setCsvFile(data);
            });
        };
        reader.readAsText(e[0]);
        let file = {
            fileName:e[0].name, 
            fileSize: e[0].size / 1000000
        }
        setFileObj(file);
    }

    const onCancelUpload = () => {
        setFileObj(defaultFileObj);
        setCsvFile([]);
    }
    

    return (
    <div className="modal-container">
        <h2 className="modal-header">新增專案</h2>
        <div className="align-start body-padding ">
        <div className="nowrap mb-10">專案名稱：</div>
        <textarea
            className="form-textarea h20"
            onChange={handleProjectNameChange}
            value={projectName}/>
        </div>
        <div className="align-start body-padding mt-20">
        <FormControl>
            <div className="nowrap mb-10">專案類別</div>
            <Select onChange={handleProjectType} value={projectType} native>
                <option value={"MRC"}>MRC</option>
                <option value={"Sentiment"}>Sentiment</option>
            </Select>
        </FormControl>
        </div>
        <div className="align-start body-padding mt-20">
        <div className="nowrap mb-10">專案說明與需求：</div>
        <textarea
            className="form-textarea h80"
            value = {labelInfo}
            onChange={handleLabelInfoChange}/>
        </div>
        <div className="align-start body-padding mt-20">
            <div className="nowrap mb-10">專案角色：</div>
            <div className="start-center">
                <div className="role mt-5">
                    {profileObj.name + '-' + profileObj.email}
                    <span className="ml-40"> 管理者 </span>
                </div>
            </div>
            {members ? members.map((member, idx) => (
                <div className="mt-20 select" key={idx}>
                    <FormControl>
                        <InputLabel>新增人員</InputLabel>
                        <Select onChange={handleSelectedUserChange(idx)}  value={member.userId ? member.userId: ""} native>
                        {users ? users.map(function(user){
                            return ( <option key={user.userId} value={user.userId}>{user.name + '-' + user.email}</option> )
                        }): ""}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <InputLabel>角色</InputLabel>
                        <Select onChange={handleSelectedStatusCodeAdd(idx)} value={member.statusCode} native>
                            <option value={"1"}>管理者</option>
                            <option value={"2"}>標註員</option>
                        </Select>
                    </FormControl>
                </div>
                )) : ""}
            <div className="add-btn" onClick={addMember}>
                新增人員
                <div className="flex-wrap ml-10"><AddCircleRoundedIcon fontSize="small"/></div>
            </div>
        </div>
        <div className="align-start body-padding mt-20">
            <div className="nowrap mb-10">上傳檔案：</div>
            {fileObj.fileName !== "" ?
                <div className="justify-center file-display" onClick={onCancelUpload}>
                    <div className="flex-wrap mr-5"><DescriptionRoundedIcon fontSize="small"/></div>
                    <p>{fileObj.fileName} <span className="text-normal ml-10">{fileObj.fileSize.toFixed(2)} MB</span></p> 
                    <div className="flex-wrap ml-10"><CloseRoundedIcon fontSize="small"/></div>
                </div>:
                <Dropzone onDrop={onDrop}>
                    {({getRootProps, getInputProps}) => (
                        <section className="width-all">
                            <div {...getRootProps()} className="dropZone center-center">
                                <input {...getInputProps()} accept=".csv"/>
                                <p>拖曳或點擊檔案以上傳</p>
                            </div>
                        </section>
                    )}
                </Dropzone>    
            }

        </div>
        <div className="justify-end mt-20">
            <div className="save-btn center-center" onClick={saveProject}>
                儲存
            </div>
        </div>
    </div>
    )
}

export default AddProjectPage;