import './_global.css';
import './Header.css';
import lab_labeler_logo from '../assets/label_lab_logo.png';
import EntryMenu from '../components/EntryMenu';
import AccountMenu from '../components/AccountMenu';
import {
  Link,
  useRouteMatch
} from "react-router-dom";

function Header(props) {
  let { url } = useRouteMatch();
  return (
    <div id="Header" className="justify-around">
      <div className="justify-start header-logo-container">
        <img className="header-logo" src={lab_labeler_logo} alt="" />
        <EntryMenu />
      </div>
      <div className="justify-end header-router-container">
        {!props.isManagePage ? 
          <div className="flex-wrap">
            <Link to={`${url}/Label`}><div className="header-router-button">標記</div></Link>
            <Link to={`${url}/Validation`}><div className="header-router-button">驗證</div></Link>
          </div>:
          ""
        }
        <AccountMenu/>
      </div>
    </div>
  )
}

export default Header;