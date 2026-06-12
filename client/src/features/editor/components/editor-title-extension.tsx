import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Extension } from "@tiptap/react";

const TitleExtension = Extension.create({
    name: "title",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("title"),

                filterTransaction: (transaction, state) => {
                    if (!transaction.docChanged) return true;

                    const firstNodeSize = state.doc.firstChild?.nodeSize ?? 0;

                    // Checks each step to see if it modifies the first node
                    for (const step of transaction.steps) {
                        const stepMap = step.getMap();
                        let touchesFirstNode = false;

                        // Check if step affects positions within first node
                        stepMap.forEach((oldStart, __oldEnd) => {
                            if (oldStart < firstNodeSize) {
                                touchesFirstNode = true;
                            }
                        });

                        // Also check step.from directly for AddMarkStep, RemoveMarkStep, etc.
                        // @ts-ignore
                        const from = step.from ?? step.pos ?? 0;
                        // @ts-ignore
                        const to = step.to ?? from;

                        if (from < firstNodeSize || to < firstNodeSize) {
                            touchesFirstNode = true;
                        }

                        if (touchesFirstNode) {
                            const newFirstNode = transaction.doc.firstChild;

                            // Block heading level changes
                            if (
                                newFirstNode &&
                                (newFirstNode.type.name !== "heading" ||
                                    newFirstNode.attrs.level !== 1)
                            ) {
                                return false;
                            }

                            // Block mark additions (bold, italic, underline, fontSize, etc.)
                            if (
                                "mark" in step ||
                                step.constructor.name === "AddMarkStep"
                            ) {
                                return false;
                            }
                        }
                    }

                    return true;
                },

                appendTransaction: (__transactions, __oldState, newState) => {
                    const { doc, tr } = newState;
                    const firstNode = doc.firstChild;
                    let modified = false;

                    if (!firstNode) return null;

                    const firstNodeEnd = firstNode.nodeSize;

                    // Ensure it's h1
                    if (
                        firstNode.type.name !== "heading" ||
                        firstNode.attrs.level !== 1
                    ) {
                        const headingType = newState.schema.nodes.heading;
                        tr.setNodeMarkup(0, headingType, { level: 1 });
                        modified = true;
                    }

                    // Aggressively remove ALL marks from first node
                    if (firstNode.content.size > 0) {
                        // Position 1 is start of content inside first node, firstNodeEnd - 1 is end
                        const from = 1;
                        const to = firstNodeEnd - 1;

                        // Get all mark types and remove them
                        const markTypes = Object.values(newState.schema.marks);
                        markTypes.forEach((markType) => {
                            if (tr.doc.rangeHasMark(from, to, markType)) {
                                tr.removeMark(from, to, markType);
                                modified = true;
                            }
                        });
                    }

                    return modified ? tr : null;
                },
            }),
        ];
    },
});

export default TitleExtension;
