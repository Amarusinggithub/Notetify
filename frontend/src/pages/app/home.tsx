import { Editor } from 'components/tiptap';
import { PlaceholderPattern } from '../../components/ui/placeholder-pattern';
//import AppLayout from '../../layouts/app-layout';
//import { type BreadcrumbItem } from '../../types';

/*const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Home',
		href: '/Home',
	},
];*/

const appId = '7j9y6m10';
const room = `room.${new Date()
	.getFullYear()
	.toString()
	.slice(-2)}${new Date().getMonth() + 1}${new Date().getDate()}-ok`;

// ydoc and provider for Editor A
const ydocA = new Y.Doc();
const providerA = new TiptapCollabProvider({
	appId,
	name: room,
	document: ydocA,
});

export default function Home() {
	return (
		<>
			<Editor provider={providerA} ydoc={ydocA} room={room} />
		</>
	);
}
