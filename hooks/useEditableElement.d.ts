interface useEditableElementProps {
    pasteClean?: boolean;
    enterForSubmit?: boolean;
    htmlDefault?: string;
}
export default function useEditableElement({ pasteClean, enterForSubmit, htmlDefault, }: useEditableElementProps): ({
    ref: import("react").RefObject<null>;
    contentEditable: boolean;
    onPaste: (event: ClipboardEvent) => void;
    onKeyDown: (event: KeyboardEvent) => void;
    focus?: undefined;
    updateSpanByCharacters?: undefined;
    completeString?: undefined;
    getCharacters?: undefined;
} | {
    focus: (oData: any) => void;
    updateSpanByCharacters: (oDataSet: {
        charactersSet?: string;
        data?: {
            dataid?: string;
            string?: string;
            onEdit: () => void;
        };
    }) => void;
    completeString: (oData: {
        charactersset?: string;
        string?: string;
    }) => void;
    getCharacters: () => string;
    ref?: undefined;
    contentEditable?: undefined;
    onPaste?: undefined;
    onKeyDown?: undefined;
})[];
export {};
//# sourceMappingURL=useEditableElement.d.ts.map