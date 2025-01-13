import React, {useContext} from "react";
import SideNav from "../components/sidebar.jsx";
import Navbar from "../components/navbar.jsx";
import {SideNavContext} from "../context/SideNavContext.jsx";
import {Content} from "../features/auth/components/content.jsx";


const MainPage = () => {
    const {isSideNavOpen} = useContext(SideNavContext);

    return (
        <div className="container">
            <Navbar/>
            <div className="child-container">
                <SideNav/>
                <div
                    className="content-container"
                    style={{marginLeft: isSideNavOpen ? "250px" : "50px"}}
                >
                    <Content/>
                </div>
            </div>
        </div>
    );
};

export default MainPage;

