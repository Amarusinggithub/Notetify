import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { EmojiItem } from "@tiptap/extension-emoji";

// Minimal shape of the props TipTap's suggestion utility passes to onKeyDown.
// (@tiptap/suggestion is a transitive dep and isn't directly importable.)
export type SuggestionKeyDownProps = { event: KeyboardEvent };

export type EmojiListProps = {
    items: EmojiItem[];
    command: (props: { name: string }) => void;
};

export type EmojiListRef = {
    onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

export const EmojiList = forwardRef<EmojiListRef, EmojiListProps>(
    (props, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);

        const selectItem = (index: number) => {
            const item = props.items[index];

            if (item) {
                props.command({ name: item.name });
            }
        };

        const upHandler = () => {
            setSelectedIndex(
                (selectedIndex + props.items.length - 1) % props.items.length,
            );
        };

        const downHandler = () => {
            setSelectedIndex((selectedIndex + 1) % props.items.length);
        };

        const enterHandler = () => {
            selectItem(selectedIndex);
        };

        useEffect(() => setSelectedIndex(0), [props.items]);

        useImperativeHandle(
            ref,
            () => {
                return {
                    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
                        if (event.key === "ArrowUp") {
                            upHandler();
                            return true;
                        }

                        if (event.key === "ArrowDown") {
                            downHandler();
                            return true;
                        }

                        if (event.key === "Enter") {
                            enterHandler();
                            return true;
                        }

                        return false;
                    },
                };
            },
            [upHandler, downHandler, enterHandler],
        );

        return (
            <div className="dropdown-menu">
                {props.items.map((item, index) => (
                    <button
                        className={index === selectedIndex ? "is-selected" : ""}
                        key={index}
                        onClick={() => selectItem(index)}
                    >
                        {item.fallbackImage ? (
                            <img
                                src={item.fallbackImage}
                                style={{ verticalAlign: "middle" }}
                                alt={item.name}
                            />
                        ) : (
                            item.emoji
                        )}
                        :{item.name}:
                    </button>
                ))}
            </div>
        );
    },
);
