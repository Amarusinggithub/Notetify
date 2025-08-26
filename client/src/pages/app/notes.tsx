import {
	ClientSideSuspense,
	LiveblocksProvider,
	RoomProvider,
} from '@liveblocks/react/suspense';
import { useParams } from 'react-router';
import { EditorNotesSidebar } from '../../components/app-notes-sidebar';
import { Editor } from '../../components/editor';
import {
	NotesSidebarInset,
	NotesSidebarProvider,
} from '../../components/ui/notes-sidebar';

export default function Notes() {
	const params = useParams();
	return (
		<LiveblocksProvider
			resolveUsers={async ({ userIds }) => {
				// ["marc@example.com", ...]
				console.log(userIds);
				return undefined;
				// Return a list of users
				// ...
			}}
			publicApiKey={
				'pk_dev_-jCBKl4-AWCtRQRkEgoS3IGyZTb7G1kfkVuX20cPxJrz4RjDA2ttgGR1EuGkX6z1'
			}
		>
			<RoomProvider id={`my-room-${params.id}`}>
				<ClientSideSuspense fallback={<div>Loading…</div>}>
					<NotesSidebarProvider defaultOpen={true}>
						<EditorNotesSidebar />
						<NotesSidebarInset>
							<Editor />
						</NotesSidebarInset>
					</NotesSidebarProvider>
				</ClientSideSuspense>
			</RoomProvider>
		</LiveblocksProvider>
	);
}
