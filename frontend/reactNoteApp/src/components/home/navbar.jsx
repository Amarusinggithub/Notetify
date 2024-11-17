import {useState} from "react";
import "../../styles/navbar.css";

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
            <div></div>
            <h1> {props.text}</h1>

            <form onSubmit={handleSearchSubmit} className={"search-container"}>
                <button type={"submit"}></button>
                <input name={"search"} placeholder={"search..."} value={search} onChange={handleSearchChange}
                       onSubmit={handleSearchSubmit} type={"text"}/></form>
        </div>
    );
}

export default Navbar;