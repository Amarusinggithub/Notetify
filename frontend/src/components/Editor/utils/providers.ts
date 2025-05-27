import { Provider as LexicalProvider } from '@lexical/yjs';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

const wsUrl = `${import.meta.env.VITE_WS_ORIGIN}/ws/lexical`;

export function createWebsocketProvider(
	room: string,
	yjsDocMap: Map<string, Y.Doc>,
	connection: boolean,
): LexicalProvider {
	const doc = getDocFromMap(room, yjsDocMap);
	const wsProvider = new WebsocketProvider(wsUrl, room, doc, {
		connect: connection,
		params: { readonly: 'false' },
	});

	// @ts-expect-error TODO: FIXME
	return wsProvider;
}

function getDocFromMap(room: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {
	let doc = yjsDocMap.get(room);

	if (doc === undefined) {
		doc = new Y.Doc();
		yjsDocMap.set(room, doc);
	} else {
		doc.load();
	}

	return doc;
}
