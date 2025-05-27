interface LexicalJSONNode {
	type: string;
	children?: LexicalJSONNode[];
	indent?: number;
}

interface LexicalJSONRoot {
	root: LexicalJSONNode & { children: LexicalJSONNode[] };
}

export const DEFAULT_JSON = JSON.stringify({
	root: {
		children: [
			{
				type: 'paragraph',
				children: [],
				direction: null,
				format: '',
				indent: 0,
				version: 1,
			},
		],
		type: 'root',
		direction: null,
		format: '',
		indent: 0,
		version: 1,
	},
});

export default function parseOrDefault(input: string): string {
	if (!input.trim()) {
		console.warn('Empty state; using default.');
		return DEFAULT_JSON;
	}
	try {
		const obj = JSON.parse(input) as LexicalJSONRoot;
		sanitize(obj.root);
		if (!obj.root.children.length) {
			console.warn('Root has no children; using default.');
			return DEFAULT_JSON;
		}
		return JSON.stringify(obj);
	} catch (err) {
		console.error('Parse error; using default.', err);
		return DEFAULT_JSON;
	}
}

function sanitize(node: LexicalJSONNode) {
	if (node.type === 'listitem' && (!Number.isInteger(node.indent) || node.indent! < 0)) {
		node.indent = 0;
	}
	node.children?.forEach(sanitize);
}
