import './ParagraphCards.css'
import './ProjectManagePage.css'
import './Labeling.css'
import 'react-responsive-modal/styles.css';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import AddCircleRoundedIcon from '@material-ui/icons/AddCircleRounded';
import { BASEURL } from "../config"
import { useState, useEffect } from "react"
import axios from 'axios'

function AddProjectPage() {
    var defaultAddProjectObj = {
        projectName:"康健雜誌 MRC",
        projectType:"MRC",
        projectId:1, 
        labelInfo:
          `請依循標註注意事項進行標註:\n• 請標記出最短可行的答案作為原則，不須包含任何前綴詞，結尾也不需要包含句號等標點符號\n• 請參考作答區域右方的提問紀錄，盡量不要重覆到他人問過的問題`,
    }
    var defaultMember = {
            userId:0,
            codeType:'1',
            statusCode:'2',
    }

    const [users, setUsers] = useState();
    const [projectName, setProjectName] = useState("");
    const [projectType, setProjectType] = useState("MRC");
    const [labelInfo, setLabelInfo] = useState(defaultAddProjectObj.labelInfo);
    const [members, setMembers] = useState([defaultMember]);

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

    const saveProject = () => {
        if(!projectName){
            alert("需要填寫專案名稱")
            return
        }
        if(!labelInfo){
            alert("需要填寫專案說明")
            return
        }
        let args = {
            projectName,
            projectType,
            labelInfo,
            members,
        }
        console.log(args)
        // saveAuth();
        // getProjectUsers(focusProject);
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
    const handleSelectedUserAdd = idx => (event) => {
        const {label, value} = event;
        console.log(label, value);
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
        {members ? members.map((member, idx) => (
            <div className="mt-10 select" key={idx}>
            <FormControl>
                <InputLabel>新增人員</InputLabel>
                <Select onChange={handleSelectedUserAdd(idx)}  value={member.userId ? member.userId: ""} native>
                {users ? users.map((user, idx) => (
                    <option key={idx} value={user.userId}>{user.email}</option>
                )): ""}
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
        <div className="justify-end mt-20">
        <div className="save-btn center-center" onClick={saveProject}>
            儲存
        </div>
        </div>
    </div>
    )
}

export default AddProjectPage;