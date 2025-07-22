import { Editor } from 'components/editor';
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
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
		<LiveblocksProvider publicApiKey={"pk_dev_-jCBKl4-AWCtRQRkEgoS3IGyZTb7G1kfkVuX20cPxJrz4RjDA2ttgGR1EuGkX6z1"}>
      <RoomProvider id="my-room">
		        <ClientSideSuspense fallback={<div>Loading…</div>}>
			<Editor provider={providerA} ydoc={ydocA} room={room} />
			        </ClientSideSuspense>
			  </RoomProvider>
    </LiveblocksProvider>
		</>
	);
}
