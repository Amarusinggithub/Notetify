import React, {useContext} from "react";
import SideNav from "../components/sidebar.jsx";
import Navbar from "../components/navbar.jsx";
import {SideNavContext} from "../context/SideNavContext.jsx";

const MainPage = () => {
    const {isSideNavOpen} = useContext(SideNavContext);

    return (
        <div className="main-container">
            <Navbar/>

            <div
                className="content-container"
                style={{
                    marginLeft: isSideNavOpen ? "250px" : "50px",
                    width: isSideNavOpen ? "calc(100% - 250px)" : "calc(100% - 50px)",
                }}
            >
                <SideNav/>

                <div className="page-content">
                    <h1>Welcome to the Main Page</h1>
                    <p>This is where your main content goes.</p>
                </div>
            </div>
        </div>
    );
};

export default MainPage;
