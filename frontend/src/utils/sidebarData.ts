import { faArchive, faLightbulb, faStar, faTrash } from '@fortawesome/free-solid-svg-icons';

export const sidebarData = [
  {
    title: 'Notes',
    icon: faLightbulb,
    path: '/',
  },
  {
    title: 'Favorites',
    icon: faStar,
    path: '/favorite',
  },
  {
    title: 'Archive',
    icon: faArchive,
    path: '/archive',
  },
  {
    title: 'Trash',
    icon: faTrash,
    path: '/trash',
  },
];
