import {
	ClientSideSuspense,
	LiveblocksProvider,
	RoomProvider,
} from '@liveblocks/react/suspense';
import { Editor } from '../../components/editor';
//import { type BreadcrumbItem } from '../../types';

/*const breadcrumbs: BreadcrumbItem[] = [
	{
		title: 'Home',
		href: '/Home',
	},
];*/

export default function Home() {
	return (
		<>

			<LiveblocksProvider
				publicApiKey={
					'pk_dev_-jCBKl4-AWCtRQRkEgoS3IGyZTb7G1kfkVuX20cPxJrz4RjDA2ttgGR1EuGkX6z1'
				}
			>
				<RoomProvider id="my-room">
					<ClientSideSuspense fallback={<div>Loading…</div>}>
						<Editor />
					</ClientSideSuspense>
				</RoomProvider>
			</LiveblocksProvider>
			
		</>
	);
}



