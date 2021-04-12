import './ParagraphCards.css'
import './ProjectManagePage.css'
import './Labeling.css'
import 'react-responsive-modal/styles.css';
import Loader from "react-loader-spinner";
import { Modal } from 'react-responsive-modal';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import AddProjectPage from './AddProjectPage' // temp
import { BASEURL } from "../config"
import { useState, useEffect } from "react"
import { useSelector} from 'react-redux'
import axios from 'axios'

function EditProjectPage(props) {
    const [users, setUsers] = useState();
    const [focusProject, setFocusProject] = useState();
    const [selectedUserId, setSelectedUserId] = useState();
    const [selectedStatusCode, setSelectedStatusCode] = useState("2");
    const [projectUsers, setProjectUsers] = useState();

    useEffect(() => {
        initeditProject(props.project);
    }, [])

    const initeditProject = (project) => {
        getUsers(project);
        getProjectUsers(project);
        console.log(project);
        setFocusProject(project);
        return
    }

    const getUsers = async (project) => {
        let arg = {
            projectId: project.projectId,
        }
        const res = await axios.post(`${BASEURL}/users`, arg);
        console.log("users", res.data.map(x => x.email));
        setUsers(res.data);
        setSelectedUserId(res.data[0].userId)
    };
    
    // get users in the project and set list.
    const getProjectUsers = async (project) => {
        let arg = {
            projectId: String(project.projectId),
        }
        const res = await axios.post(`${BASEURL}/projectUsers`, arg);
        console.log("projectUser", res.data);
        setProjectUsers(res.data);
    };
    
    // handle selection change
    const handleSelectedUser = (event) => {
        console.log(event.target.value);
        setSelectedUserId(event.target.value);
    }

    const handleSelectedStatusCode = (event) => {
        console.log(event.target.value);
        setSelectedStatusCode(event.target.value);
    }
    
    const saveAuth = async () => {
        if(!selectedUserId || !selectedStatusCode) return;
        console.log(selectedUserId)
        let arg = {
          projectId: focusProject.projectId,
          userId: selectedUserId,
          statusCode: selectedStatusCode,
        }
        const res = await axios.post(`${BASEURL}/saveAuth`, arg);
        if(res.data.success) {
          alert("success")
        }
        else{
          alert("insert failed")
        }
    };
    
    const saveProject = () => {
        saveAuth();
        getProjectUsers(focusProject);
    }

    return(
        <div className="modal-container">
            <h2 className="modal-header">{focusProject ? focusProject.projectName : ""}</h2>
            {projectUsers ? projectUsers.map((projectUser, idx) => (
            <div key={idx} className="start-center">
                <div key={idx} className="role mt-5">
                    {projectUser.email}
                    <span className="ml-40">
                        {projectUser.statusCode === "1" ? "管理者" : "標註員"}
                    </span>
                </div>
            </div>
            )) : ""}
            <div className="mt-20 select">
            <FormControl>
                <InputLabel>新增人員</InputLabel>
                <Select onChange={handleSelectedUser}  value={selectedUserId ? selectedUserId: ""} native>
                {users ? users.map((user, idx) => (
                    <option key={idx} value={user.userId}>{user.email}</option>
                )): ""}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel htmlFor="age-native-simple">角色</InputLabel>
                <Select onChange={handleSelectedStatusCode} value={selectedStatusCode} native>
                <option value={"1"}>管理者</option>
                <option value={"2"}>標註員</option>
                </Select>
            </FormControl>
            </div>
            <div className="justify-end mt-20">
            <div className="save-btn center-center" onClick={saveProject}>
                儲存
            </div>
            </div>
        </div>
    )
}

export default EditProjectPage;