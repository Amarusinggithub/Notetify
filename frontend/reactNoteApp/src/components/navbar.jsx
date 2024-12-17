import {useState} from "react";
import "../styles/navbar.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faMagnifyingGlass} from "@fortawesome/free-solid-svg-icons";

const Navbar = (props) => {
    const [search, setSearch] = useState("");

    const handleSearchChange = event => {
        event.preventDefault();
        setSearch(event.target.value);
    }

    const handleSearchSubmit = event => {
        event.preventDefault();
        setSearch(event.target.value);
    }


    return (
        <div className={"navbar"}>
            <div><FontAwesomeIcon icon={faBars} className={"search-icon"}/></div>
            <h1> {props.text}</h1>
            <div></div>

            <form onSubmit={handleSearchSubmit} className={"search-container"}>
                <button type={"submit"}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} className={"search-icon"}/>
                </button>
                <input name={"search"} placeholder={"search..."} value={search} onChange={handleSearchChange}
                       onSubmit={handleSearchSubmit} type={"text"}/></form>
        </div>
    );
}

export default Navbar;