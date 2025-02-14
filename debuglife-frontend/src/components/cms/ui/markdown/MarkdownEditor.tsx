import type {FC} from "react";
import {Milkdown, useEditor} from "@milkdown/react";
import {emoji} from "@milkdown/plugin-emoji";
import {Crepe} from "@milkdown/crepe";
import {fetchWithCSRF} from "@/helpers/common/csrf";
import {useRef, useEffect} from "react";

interface MilkdownEditorProps {
    markdown: string;
    setMarkdown: (markdown: string) => void;
}

export const MilkdownEditor: FC<MilkdownEditorProps> = ({
    markdown,
    setMarkdown,
}) => {
    // Store the Crepe instance so we can manually destroy it later.
    const editorInstance = useRef<Crepe | null>(null);

    useEditor((root) => {
        const crepe = new Crepe({
            root,
            defaultValue: markdown,
            features: {
                [Crepe.Feature.Latex]: false,
            },
            featureConfigs: {
                [Crepe.Feature.Placeholder]: {
                    text: "Type something here...",
                },
                [Crepe.Feature.ImageBlock]: {
                    onUpload: async (file: File) => {
                        const formData = new FormData();
                        formData.append("file", file);

                        // Provide alt_text and caption in a JSON payload field
                        const payload = {
                            alt_text: "Uploaded image",
                            caption: "Uploaded via Milkdown editor",
                        };
                        formData.append("payload", JSON.stringify(payload));

                        const res = await fetchWithCSRF(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/blog/gallery`,
                            {
                                method: "POST",
                                body: formData,
                            },
                        );

                        if (!res.ok) {
                            throw new Error("Image upload failed");
                        }

                        const data = await res.json();
                        // Assuming the API returns an object with a URL field
                        return data.image;
                    },
                },
            },
        });

        crepe.editor.use(emoji);

        crepe.on((listener) => {
            listener.markdownUpdated((_, markdown, prevMarkdown) => {
                if (markdown !== prevMarkdown) {
                    setMarkdown(markdown);
                }
            });
        });

        // Save the instance for cleanup.
        editorInstance.current = crepe;
        return crepe;
    }, []);

    // When the component unmounts, manually destroy the Crepe instance.
    useEffect(() => {
        return () => {
            if (editorInstance.current) {
                editorInstance.current.destroy();
                editorInstance.current = null;
            }
        };
    }, []);

    return <Milkdown />;
};

export default MilkdownEditor;
