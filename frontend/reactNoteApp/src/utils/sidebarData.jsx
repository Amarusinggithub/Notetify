// src/components/sidebarData.jsx

import {faArchive, faNoteSticky, faStar, faTrash} from "@fortawesome/free-solid-svg-icons";

export const sidebarData = [
    {
        title: "Notes",
        icon: faNoteSticky,
        path: "/notes",
    },
    {
        title: "Favorites",
        icon: faStar,
        path: "/favorites",
    },
    {
        title: "Archive",
        icon: faArchive,
        path: "/archive",
    },
    {
        title: "Trash",
        icon: faTrash,
        path: "/trash",
    },
];
