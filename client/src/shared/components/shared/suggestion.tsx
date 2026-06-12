import { computePosition } from '@floating-ui/dom';
import { ReactRenderer } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import type { EmojiItem } from '@tiptap/extension-emoji';

import {
	EmojiList,
	type EmojiListProps,
	type EmojiListRef,
	type SuggestionKeyDownProps,
} from '@/shared/components/shared/emoji-list';

// Subset of TipTap's SuggestionProps that this renderer actually reads.
// (@tiptap/suggestion is a transitive dep and isn't directly importable.)
type EmojiSuggestionProps = EmojiListProps & {
	editor: Editor;
	clientRect?: (() => DOMRect | null) | null;
};

export default {
	items: ({
		editor,
		query,
	}: {
		editor: Editor;
		query: string;
	}): EmojiItem[] => {
		return (editor.storage.emoji.emojis as EmojiItem[])
			.filter((item) => {
				return (
					item.shortcodes.find((shortcode) =>
						shortcode.startsWith(query.toLowerCase())
					) || item.tags.find((tag) => tag.startsWith(query.toLowerCase()))
				);
			})
			.slice(0, 5);
	},

	allowSpaces: false,

	render: () => {
		let component: ReactRenderer<EmojiListRef, EmojiListProps>;

		function repositionComponent(clientRect: DOMRect | null) {
			if (!component?.element || !clientRect) {
				return;
			}

			const virtualElement = {
				getBoundingClientRect() {
					return clientRect;
				},
			};

			const element = component.element as HTMLElement;
			computePosition(virtualElement, element, {
				placement: 'bottom-start',
			}).then((pos) => {
				Object.assign(element.style, {
					left: `${pos.x}px`,
					top: `${pos.y}px`,
					position: pos.strategy === 'fixed' ? 'fixed' : 'absolute',
				});
			});
		}

		return {
			onStart: (props: EmojiSuggestionProps) => {
				component = new ReactRenderer(EmojiList, {
					props,
					editor: props.editor,
				});

				document.body.appendChild(component.element);
				repositionComponent(props.clientRect?.() ?? null);
			},

			onUpdate(props: EmojiSuggestionProps) {
				component.updateProps(props);
				repositionComponent(props.clientRect?.() ?? null);
			},

			onKeyDown(props: SuggestionKeyDownProps) {
				if (props.event.key === 'Escape') {
					document.body.removeChild(component.element);
					component.destroy();

					return true;
				}

				return component.ref?.onKeyDown(props) ?? false;
			},

			onExit() {
				if (document.body.contains(component.element)) {
					document.body.removeChild(component.element);
				}
				component.destroy();
			},
		};
	},
};
