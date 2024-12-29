import {useContext} from "react";
import NoteContext from "../context/NoteContext.jsx";
import {faRotateRight,} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const SideNav = () => {
    const {isSideNavOpen,} = useContext(NoteContext);
    return (<>

               <span
                   style={{
                       fontSize: "30px",
                       cursor: "pointer",
                       marginLeft: isSideNavOpen ? "260px" : "60px",
                   }}

               >
            </span>
            <div className="sidenav" style={{width: isSideNavOpen ? "250px" : "50px"}}>
                <button className={"sidenav-item"}><FontAwesomeIcon icon={faRotateRight} className="icon"/>
                    <h3>Notes</h3></button>
                <button className={"sidenav-item"}><FontAwesomeIcon icon={faRotateRight} className="icon"/>
                    <h3>Favorites</h3></button>
                <button className={"sidenav-item"}><FontAwesomeIcon icon={faRotateRight} className="icon"/>
                    <h3>Archived</h3></button>

                <button className={"sidenav-item"}><FontAwesomeIcon icon={faRotateRight} className="icon"/>
                    <h3>Trash</h3></button>
            </div>

        </>

    )
}

export default SideNav;