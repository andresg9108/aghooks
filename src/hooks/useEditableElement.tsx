import {
    useRef
} from 'react';
import { v4 as uuidv4 } from 'uuid';

interface useEditableElementProps {
    pasteClean?: boolean;
    enterForSubmit?: boolean;
    htmlDefault?: string;
}

export default function useEditableElement({
    pasteClean = false,
    enterForSubmit = false,
    htmlDefault = "",
}: useEditableElementProps){
    const elementRef = useRef(null);

    /*
    Description: Text paste controller.
    Descripción: Controlador de pegado de texto.
    Andrés González
    25-12-2024
    */
    const onPaste = (event: ClipboardEvent) => {
        if(pasteClean){
            event.preventDefault();
            const oClipboardData = event.clipboardData
            
            if(oClipboardData){
                const sText = oClipboardData.getData('text/plain');

                const oTemporaryElement = document.createElement('div');
                oTemporaryElement.innerHTML = sText;
                const sNewText = oTemporaryElement.textContent || oTemporaryElement.innerText || '';

                setTimeout(() => {
                    document.execCommand('insertText', false, sNewText);
                }, 0);
            }
        }
    };

    /*
    Description: Keyboard event handler.
    Descripción: Controlador de los eventos del teclado.
    Andrés González
    25-11-2023
    */
    const onKeyDown = (event: KeyboardEvent) => {
        if(enterForSubmit){
            switch(event.key) {
                case 'Enter':
                    event.preventDefault();
        
                    if(event.shiftKey) {
                        setTimeout(() => {
                            document.execCommand('insertText', false, '\n ');
                        }, 0);
                    } else {
                        const oForm = (event.target as HTMLElement).closest('form') as HTMLFormElement;
                        if (oForm) {
                            const oSubmitEvent = new Event('submit', { bubbles: true });
                            oForm.dispatchEvent(oSubmitEvent);
                        }
                    }
        
                    break;
                default:
                    break;
            }
        }
    };

    /*
    Description: Focus with keyboard cursor at the end of the editable element.
    Descripción: Foco con el cursor del teclado al final del elemento editable.
    Andrés González
    25-11-2023
    */
    const focus = (oData: any) => {
        const oElement = elementRef.current as HTMLElement | null;

        if (oElement) {
            oElement.focus();
            const range = document.createRange();
            const sel = window.getSelection();

            if (sel) {
                range.selectNodeContents(oElement);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
    }

    /*
    Description: Load SPAN and data
    Descripción: Carga de SPAN y datos
    Andrés González
    16-06-2023
    */
    const loadSpanAndData = (oSpan: HTMLSpanElement, oData: {
        string?: string;
        onEdit: () => void;
    }) => {
        const sString = oData.string !== undefined ? oData.string : '';

        const oEditSpan = document.createElement('span');
        const oCloseSpan = document.createElement('span');

        oSpan.innerHTML = sString;
        oSpan.setAttribute('contenteditable', 'false');
        oSpan.setAttribute('data-content', JSON.stringify(oData));

        oEditSpan.setAttribute('class', 'fa-solid fa-pen-to-square');
        oEditSpan.onclick = oData.onEdit;

        oCloseSpan.setAttribute('class', 'fa-solid fa-x');
        oCloseSpan.onclick = (event: MouseEvent) => {
            const oElement = (event.target as HTMLElement).parentNode as HTMLElement | null; 
            if (oElement && oElement.parentNode){
                const oParent = oElement.parentNode as HTMLElement;
                oParent.removeChild(oElement);
            }
        };

        oSpan.appendChild(oEditSpan);
        oSpan.appendChild(oCloseSpan);
    };

     /*
    Description: Update SPAN element by characters in an editable DOM element.
    Descripción: Actualice el elemento SPAN por caracteres en un elemento DOM editable.
    Andrés González
    09-10-2023
    */
    const updateSpanByCharacters = (oDataSet: {
        charactersSet?: string;
        data?: {
            dataid?: string;
            string?: string;
            onEdit: () => void;
        };
    }) => {
        const oElement = elementRef.current as HTMLElement | null;
        const sCharactersSet = oDataSet.charactersSet !== undefined ? oDataSet.charactersSet : '';
        let oData = oDataSet.data !== undefined ? oDataSet.data : { onEdit: () => {} }; // Asignar un valor por defecto a onEdit
        const sDataId = oData.dataid !== undefined ? oData.dataid : '';
    
        if (oElement) {
            if (sDataId !== '') {
                let oSpan = oElement.querySelector('span') as HTMLSpanElement | null;
    
                while (oSpan !== null) {
                    const oDataSpan = JSON.parse(oSpan.getAttribute('data-content') || '{}');
                    const sDataIdSpan = oDataSpan.dataid !== undefined ? oDataSpan.dataid : '';
    
                    if (sDataIdSpan === sDataId && oSpan.nodeName === 'SPAN') {
                        loadSpanAndData(oSpan, oData);
                    }
    
                    oSpan = oSpan.nextElementSibling as HTMLSpanElement;
                }
            } else {
                oData.dataid = uuidv4();
    
                let oChild = oElement.firstChild as ChildNode | null;
    
                while (oChild !== null) {
                    if (oChild.nodeType === Node.TEXT_NODE) {
                        const sChildText = oChild.textContent || '';
    
                        if (sChildText.indexOf(sCharactersSet) !== -1) {
                            const sCharactersSetFilter = sCharactersSet.replace('(', '\\(').replace('/', '\\/');
                            const aText = sChildText.split(new RegExp(`(${sCharactersSetFilter})`, 'g'));
                            const oParent = oChild.parentNode as HTMLElement;
    
                            let iCount = 0;
                            let oNext: ChildNode = oChild;
    
                            for (let i = 0; i < aText.length; i++) {
                                const sText = aText[i];
    
                                if (sText === sCharactersSet) {
                                    const oSpan = document.createElement('span');
                                    loadSpanAndData(oSpan, oData);
    
                                    if (iCount === 0) {
                                        oParent.replaceChild(oSpan, oChild);
                                    } else {
                                        oParent.insertBefore(oSpan, oNext.nextSibling);
                                    }
    
                                    const oBlankSpace = document.createTextNode('\u00A0'); // &nbsp;
                                    oParent.insertBefore(oBlankSpace, oSpan.nextSibling);
    
                                    oNext = oBlankSpace;
                                    iCount++;
                                } else if (sText !== '') {
                                    const oText = document.createTextNode(sText);
    
                                    if (iCount === 0) {
                                        oParent.replaceChild(oText, oChild);
                                    } else {
                                        oParent.insertBefore(oText, oNext.nextSibling);
                                    }
    
                                    oNext = oText;
                                    iCount++;
                                }
                            }
                        }
                    }
                    oChild = oChild.nextSibling as ChildNode | null;
                }
            }
        }
    };
    
    /*
    Description: Complete a string of characters in an editable DOM element.
    Descripción: Complete una cadena de caracteres en un elemento editable del DOM.
    Andrés González
    09-10-2023
    */
    const completeString = (oData: {
        charactersset?: string;
        string?: string;
    }) => {
        const oElement = elementRef.current as HTMLElement | null;
        const sCharactersSet = oData.charactersset !== undefined ? oData.charactersset : '';
        const sString = oData.string !== undefined ? oData.string : '';
        let oChild = oElement?.firstChild as ChildNode | null;
    
        while (oChild !== null) {
            if (oChild.nodeType === Node.TEXT_NODE) {
                oChild.textContent = oChild.textContent?.replace(new RegExp(sCharactersSet, 'i'), sString) || '';
            }
            oChild = oChild.nextSibling;
        }
    };

    /*
    Description: Get the position of the keyboard cursor in an editable DOM element.
    Descripción: Obtener la posición del cursor del teclado en un elemento editable del DOM.
    Andrés González
    09-10-2023
    */
    const getKeyboardCursorPosition = (): number => {
        const oElement = elementRef.current as HTMLElement | null;
    
        if (!oElement) {
            return 0;
        }
    
        let caretOffset = 0;
        const doc = oElement.ownerDocument || document;
        const win = doc.defaultView;
    
        if (win) {
            const sel = win.getSelection();
    
            if (sel && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(oElement);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                caretOffset = preCaretRange.toString().length;
            }
        }

        return caretOffset;
    };

    /*
    Description: Get a set of characters from an editable DOM element taking into account that the keyboard cursor must be within this set and that the start and end delimiter is a white space.
    Descripción: Obtiene un conjunto de caracteres de un elemento DOM editable teniendo en cuenta que el cursor del teclado debe estar dentro de este conjunto y que el delimitador inicial y final es un espacio en blanco.
    Andrés González
    09-10-2023
    */
    const getCharacters = (): string => {
        const oElement = elementRef.current as HTMLElement | null;

        if (!oElement) {
            return '';
        }

        const iCursorPosition = getKeyboardCursorPosition(); 
        const sText = oElement.textContent?.replace(/\u00a0/g, ' ') || ''; 
        
        let iStartIndex = sText.substr(0, iCursorPosition).lastIndexOf(' ') + 1; 
        iStartIndex = iStartIndex !== -1 ? iStartIndex : 0; 
        
        let iEndIndex = sText.slice(iStartIndex).indexOf(' '); 
        iEndIndex = iEndIndex !== -1 ? iEndIndex + iStartIndex : sText.length; 
        
        return sText.substring(iStartIndex, iEndIndex).trim().toLowerCase();
    }

    return [{
        ref: elementRef,
        contentEditable: true, 
        // dangerouslySetInnerHTML: { __html: htmlDefault }, 
        onPaste, 
        onKeyDown, 
    }, {
        focus, 
        updateSpanByCharacters, 
        completeString, 
        getCharacters, 
    }];
}