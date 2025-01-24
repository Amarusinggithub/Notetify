import {useContext} from "react";
import "../styles/navbar.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faGear, faList, faMagnifyingGlass, faRotateRight} from "@fortawesome/free-solid-svg-icons";
import {SideNavContext} from "../context/SideNavContext.jsx";
import useNote from "../features/notes/hooks/useNote.jsx";

const Navbar = () => {

  const {isSideNavOpen, setIsSideNavOpen} = useContext(SideNavContext);
  const {handleSearch,search, setSearch,fetchNotes,title} = useNote();

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearch(query);
    handleSearch();
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
      <div className="menu-logo-title-container">
        <button onClick={handleSideMenuChange} className="menu-btn">
          <FontAwesomeIcon icon={faBars} className="menu-icon" />
        </button>

        {(title.length <= 0 || title === "Notes") && (
          <div className="logo-container">
            <img
              src="assets/favicon-32x32.png"
              alt="A sample image"
              width="32"
              height="32"
              className={"noteify-logo"}
            ></img>
          </div>
        )}

        {(title.length <= 0 || title === "Notes") && (
          <h1 className="title-header">Notetify</h1>
        )}
        {title.length > 0 && title !== "Notes" && (
          <h1 className="title-header">{title}</h1>
        )}
      </div>

      <form onSubmit={handleSearchSubmit} className="search-container">
        <button type="submit">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
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
        <button
          onClick={() => {
            fetchNotes();
          }}
        >
          <FontAwesomeIcon icon={faRotateRight} className="icon" />
        </button>
        <button>
          <FontAwesomeIcon icon={faList} className="icon" />
        </button>
        <button>
          <FontAwesomeIcon icon={faGear} className="icon" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
