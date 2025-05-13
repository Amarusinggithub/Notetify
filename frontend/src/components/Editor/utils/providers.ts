import {Provider} from '@lexical/yjs';
import {WebsocketProvider} from 'y-websocket';
import * as Y from 'yjs';

const wsUrl = `${import.meta.env.VITE_WS_URL}`;

export function createWebsocketProvider(
  id: string,
  yjsDocMap: Map<string, Y.Doc>,
): Provider {
  const doc = getDocFromMap(id, yjsDocMap);

  // @ts-expect-error TODO: FIXME
  return new WebsocketProvider(wsUrl, id, doc, {
    connect: true,
  });
}

function getDocFromMap(id: string, yjsDocMap: Map<string, Y.Doc>): Y.Doc {
  let doc = yjsDocMap.get(id);

  if (doc === undefined) {
    doc = new Y.Doc();
    yjsDocMap.set(id, doc);
  } else {
    doc.load();
  }

  return doc;
}
