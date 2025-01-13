import {useContext, useState} from "react";
import "../styles/navbar.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faGear, faList, faMagnifyingGlass, faRotateRight} from "@fortawesome/free-solid-svg-icons";
import {SideNavContext} from "../context/SideNavContext.jsx";
import useNote from "../features/notes/hooks/useNote.jsx";

const Navbar = () => {
  const [search, setSearch] = useState("");
  const {isSideNavOpen, setIsSideNavOpen} = useContext(SideNavContext);
  const {handleSearch} = useNote();

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    handleSearch(query);
  };

  const handleSideMenuChange = (event) => {
    event.preventDefault();
    setIsSideNavOpen(!isSideNavOpen);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    handleSearch(search);
    console.log("Search submitted:", search);
  };

  return (
      <div className="navbar">
        <button onClick={handleSideMenuChange} className="menu-btn">
          <FontAwesomeIcon icon={faBars} className="menu-icon"/>
        </button>

        <h1 className="company-name">Notetify</h1>

        <form onSubmit={handleSearchSubmit} className="search-container">
          <button type="submit">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon"/>
          </button>
          <input
              name="search"
              placeholder="Search"
              value={search}
              onChange={handleSearchChange}
              type="text"
          />
        </form>

        <div className="icons-container">
          <button>
            <FontAwesomeIcon icon={faRotateRight} className="icon"/>
          </button>
          <button>
            <FontAwesomeIcon icon={faList} className="icon"/>
          </button>
          <button>
            <FontAwesomeIcon icon={faGear} className="icon"/>
          </button>
        </div>
      </div>
  );
};

export default Navbar;
