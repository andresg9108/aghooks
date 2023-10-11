import { v4 as uuidv4 } from 'uuid';

import { 
  useRef 
} from 'react';

export const useEditableElement = () => {
  const elementRef = useRef(null);

  /*
  Description: Get a set of characters from an editable DOM element taking into account that the keyboard cursor must be within this set and that the start and end delimiter is a white space.
  Descripción: Obtiene un conjunto de caracteres de un elemento DOM editable teniendo en cuenta que el cursor del teclado debe estar dentro de este conjunto y que el delimitador inicial y final es un espacio en blanco.
  Andrés González
  09-10-2023
  */
  const getCharacters = (oData) => {
    let oElement = elementRef.current;

    let iCursorPosition = getKeyboardCursorPosition({
      element: oElement 
    });
    let sText = oElement.textContent.replace(/\u00a0/g, ' ');

    let iStartIndex = sText.substr(0, iCursorPosition).lastIndexOf(" ") + 1;
    iStartIndex = iStartIndex !== -1 ? iStartIndex : 0;

    let iEndIndex = sText.slice(iStartIndex).indexOf(" ");
    iEndIndex = iEndIndex !== -1 ? iEndIndex + iStartIndex : sText.length;

    return sText.substring(iStartIndex, iEndIndex).trim().toLowerCase()
  }

  /*
  Description: Get the position of the keyboard cursor in an editable DOM element.
  Descripción: Obtener la posición del cursor del teclado en un elemento editable del DOM.
  Andrés González
  09-10-2023
  */
  const getKeyboardCursorPosition = (oData) => {
    let oElement = oData.element !== undefined ? oData.element : null;

    let caretOffset = 0;
    let doc = oElement.ownerDocument || oElement.document;
    let win = doc.defaultView || doc.parentWindow;
    let sel = win.getSelection();
    if (sel.rangeCount > 0) {
      let range = sel.getRangeAt(0);
      let preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(oElement);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  /*
  Description: Complete a string of characters in an editable DOM element.
  Descripción: Complete una cadena de caracteres en un elemento editable del DOM.
  Andrés González
  09-10-2023
  */
  const completeString = (oData) => {
    let oElement = elementRef.current;
    let sCharactersSet = oData.charactersset !== undefined ? oData.charactersset : '';
    let sString = oData.string !== undefined ? oData.string : '';
    let oChild = oElement.firstChild;

    do{
      if(oChild.nodeType === Node.TEXT_NODE){
        oChild.textContent = oChild.textContent.replace(new RegExp(sCharactersSet, 'i'), sString);
      }
      oChild = oChild.nextSibling;
    }while(oChild !== null);
  }

  /*
  Description: Update SPAN element by characters in an editable DOM element.
  Descripción: Actualice el elemento SPAN por caracteres en un elemento DOM editable.
  Andrés González
  09-10-2023
  */
  const updateSpanByCharacters = (oDataSet) => {
    let oElement = elementRef.current;
    let sCharactersSet = oDataSet.charactersSet !== undefined ? oDataSet.charactersSet : '';
    let oData = oDataSet.data !== undefined ? oDataSet.data : {};
    let sDataId = oData.dataid !== undefined ? oData.dataid : '';

    if(sDataId !== ''){

      let oSpan = oElement.querySelector('span');

      do{
        let oDataSpan = JSON.parse(oSpan.getAttribute('data-content'));
        let sDataIdSpan = oDataSpan.dataid !== undefined ? oDataSpan.dataid : '';

        if(sDataIdSpan === sDataId && oSpan.nodeName === 'SPAN'){
          loadSpanAndData(oSpan, oData);
        }

        oSpan = oSpan.nextElementSibling;
      }while(oSpan !== null);

    }else{

      oData.dataid = uuidv4();

      let oChild = oElement.firstChild;

      do{
        if(oChild.nodeType === Node.TEXT_NODE){
          let sChildText = oChild.textContent;

          if(sChildText.indexOf(sCharactersSet) !== -1){
            // Hay que hacer que todos los caracteres de sCharactersSet escapen los caracteres especiales que tenga con un "\\".
            let sCharactersSetFilter = sCharactersSet.replace('(', '\\(').replace('/', '\\/');
            let aText = sChildText.split(new RegExp(`(${sCharactersSetFilter})`, 'g'));
            let oParent = oChild.parentNode;

            let iCount = 0;
            let oNext = {};
            for(let i=0; i<aText.length; i++){
              let sText = aText[i];

              if(sText === sCharactersSet){
                let oSpan = document.createElement("span");

                loadSpanAndData(oSpan, oData);

                if(iCount === 0){
                  oParent.replaceChild(oSpan, oChild);
                }else{
                  oParent.insertBefore(oSpan, oNext.nextSibling);
                }

                let oBlankSpace = document.createTextNode("\u00A0"); // &nbsp;
                oParent.insertBefore(oBlankSpace, oSpan.nextSibling);

                oNext = oBlankSpace;
                iCount++;
              }else if(sText !== ''){
                let oText = document.createTextNode(sText);

                if(iCount === 0){
                  oParent.replaceChild(oText, oChild);
                }else{
                  oParent.insertBefore(oText, oNext.nextSibling);
                }

                oNext = oText;
                iCount++;
              }
              
            }
          }
        }

        oChild = oChild.nextSibling;
      }while(oChild !== null);

    }
  };

  /*
  Description: Load SPAN and data
  Descripción: Carga de SPAN y datos
  Andrés González
  16-06-2023
  */
  const loadSpanAndData = (oSpan, oData) => {
    let sString = oData.string !== undefined ? oData.string : '';

    let oEditSpan = document.createElement("span");
    let oCloseSpan = document.createElement("span");
    
    oSpan.innerHTML = sString;
    oSpan.setAttribute('contenteditable', false);
    oSpan.setAttribute('data-content', JSON.stringify(oData));
    
    oEditSpan.setAttribute('class', 'fa-solid fa-pen-to-square');
    oEditSpan.onclick = oData.onEdit;
    
    oCloseSpan.setAttribute('class', 'fa-solid fa-x');
    oCloseSpan.onclick = function(){
      let oElement = this.parentNode;
      let oParent = oElement.parentNode;

      oParent.removeChild(oElement);
    };
    
    oSpan.appendChild(oEditSpan);
    oSpan.appendChild(oCloseSpan);
  };

  /*
  Description: Put focus on an editable DOM element and place the keyboard cursor at the end.
  Descripción: Ponga el foco en un elemento editable del DOM y coloque el cursor del teclado al final.
  Andrés González with the help of ChatGPT
  09-10-2023
  */
  const focus = (oData) => {
    let oElement = elementRef.current;

    oElement.focus();
    let range = document.createRange();
    let sel = window.getSelection();
    range.selectNodeContents(oElement);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /*
  Description: Text paste controller.
  Descripción: Controlador de pegado de texto.
  Andrés González
  11-10-2023
  */
  const handlePaste = (event) => {
    event.preventDefault();
    const oClipboardData = event.clipboardData || window.clipboardData;
    const sText = oClipboardData.getData('text/plain');

    const oTemporaryElement = document.createElement('div');
    oTemporaryElement.innerHTML = sText;
    const sNewText = oTemporaryElement.textContent || oTemporaryElement.innerText || '';

    setTimeout(() => {
      document.execCommand('insertText', false, sNewText);
    }, 0);
  };

  /*
  Description: Handler for keyboard events that come from the prompt.
  Descripción: Controlador de los eventos del teclado que provienen del prompt.
  Andrés González
  11-10-2023
  */
  const handleKeyDown = (event) => {
    switch(event.key){
      case 'Enter':
        event.preventDefault();

        if(event.shiftKey){
          setTimeout(() => {
            document.execCommand('insertText', false, '\n');
          }, 0);
        }else{
          let oForm = event.target.closest('form');
          let oSubmitEvent = new Event('submit', { bubbles: true });
          
          oForm.dispatchEvent(oSubmitEvent);
        }

        break;
      default:
        break;
    }
  }

  return [{
      completeString, 
      focus, 
      getCharacters, 
      handleKeyDown, 
      handlePaste, 
      updateSpanByCharacters 
    }, elementRef];
};