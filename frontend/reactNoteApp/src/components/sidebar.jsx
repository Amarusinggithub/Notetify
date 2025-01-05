import {useContext} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {sidebarData} from "../utils/sidebarData.jsx";
import "../styles/sidebar.css";
import {SideNavContext} from "../context/SideNavContext.jsx"; // Import the context

const SideNav = () => {
    const {isSideNavOpen} = useContext(SideNavContext);

  return (

      <div
          className="sidenav"
          style={{
              width: isSideNavOpen ? "250px" : "50px",
          }}
      >
          <ul>
              {sidebarData.map((item, index) => (
                  <li
                      key={index}
                      style={{
                          borderTopRightRadius: isSideNavOpen ? "40px" : "360px",
                          borderTopLeftRadius: isSideNavOpen ? "0px" : "360px",
                          borderBottomLeftRadius: isSideNavOpen ? "0px" : "360px",
                          borderBottomRightRadius: isSideNavOpen ? "40px" : "360px",
                      }}
                      className="sidenav-item"
                  >
                      <FontAwesomeIcon icon={item.icon} className="icon"/>
                      {isSideNavOpen && <h3>{item.title}</h3>}
                  </li>
              ))}
          </ul>
      </div>
  );
};

export default SideNav;
