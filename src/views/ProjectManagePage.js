import './ParagraphCards.css'
import './ProjectManagePage.css'
import './Labeling.css'
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import EditProjectPage from './EditProjectPage' // temp
import AddProjectPage from './AddProjectPage' // temp
import Header from '../components/Header'
import { BASEURL } from "../config"
import { useState, useEffect } from "react"
import { useSelector} from 'react-redux'
import axios from 'axios'

function ProjectManagePage() {
  const [projects, setProjects] = useState([]);
  const [focusProject, setFocusProject] = useState();

  const profileObj = useSelector(state => state.profileObj);
  /** open edit modal */
  const [open, setOpen] = useState(false);
  /** open add project modal */
  const [openAdd, setOpenAdd] = useState(false);

  const onCloseModal = () => setOpen(false);
  const onCloseAddModal = () => setOpenAdd(false);

  useEffect(() => {
    const getProject = async () => {
      const arg = {
        userId: profileObj.googleId,
        statusCode: "1",
      }
      const res = await axios.post(`${BASEURL}/projects`, arg)
      setProjects(res.data);
      console.log("projects", res.data)
    };
    getProject()
  }, [profileObj.googleId, openAdd])

  const editProject = (project) => {
    setFocusProject(project);
    setOpen(true);
    return
  }

  const addProject = (project) => {
    setOpenAdd(true);
    return
  }

  return (
    <div>
      <Header isManagePage={true}/>
      <div id="project" className="justify-center">
        <div className="working-area-container overflow-scroll project-working-area">
          <div className="justify-center">
            <h2>我管理的專案</h2>
          </div>
          <div className="center-center flex-wrap">
            {projects.map((project, idx) => (
              <div key={idx} className="center-center list-item" onClick={() => { editProject(project) }}>
                <div key={idx}>
                    {project.projectName}
                </div>
              </div>
            ))}
            <div className="function-button" onClick={addProject}>新增專案</div>
          </div>
        </div>
        <Modal open={open} onClose={onCloseModal} center>
          <EditProjectPage project={focusProject} onCloseCallback={onCloseModal}/>
        </Modal>
        <Modal open={openAdd} onClose={onCloseAddModal} center>
          <AddProjectPage onCloseCallback={onCloseAddModal}/>
        </Modal>
      </div>
    </div>
  )
}

export default ProjectManagePage;