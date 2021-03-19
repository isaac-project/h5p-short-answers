import { ISAACFieldListener } from './interaction';
import { handleInput } from './function';

export default class ISAACContent {
  /**
   * Populates the DOM with content provided by the content author
   *
   * @constructor
   * @param semantics {object} Parameters defined in semantics.json, with "name" as key
   * @param contentID {number} Integer representing the content ID
   * @param previousState {object} Object containing user's previous responses
   */
  constructor(semantics, contentID, previousState) {

    // global container for content instance
    this.content = document.createElement('div');
    this.content.classList.add('h5p-isaac');

    // if defaults are used during content authoring, they won't be <div> elements
    if (!semantics.task.startsWith('<div>')) { semantics.task = `<div>${semantics.task}</div>`; }
    if (!semantics.passage.startsWith('<div>')) { semantics.passage = `<div>${semantics.passage}</div>`; }

    // add task
    const taskNode = document.createElement('div');
    taskNode.innerHTML = semantics.task.trim();
    taskNode.firstElementChild.classList.add('h5p-isaac-task');
    this.content.appendChild(taskNode.firstElementChild);

    // add passage
    if (semantics.passage.trim() !== '') {
      const passageNode = document.createElement('div');
      passageNode.setAttribute('id', `${contentID}_passage`);
      passageNode.classList.add('h5p-isaac-passage');
      passageNode.innerHTML = semantics.passage.trim();
      // insert passage highlight tag around text declared by content author. indexed from 1! (\d+ in regex)
      const tag = `<span id='${contentID}_$1_mark' class='h5p-isaac-highlight h5p-isaac-highlight-hidden'>$2</span>`;
      passageNode.innerHTML = `${passageNode.innerHTML.replace(/(\d+)\*\*(.*?)\*\*/gi, tag)}`;
      this.content.appendChild(passageNode);
    }

    // add Q&A section
    const ol = document.createElement('ol');
    ol.setAttribute('id', `${contentID}_questions`);
    ol.classList.add('h5p-isaac-questions');

    for (let fieldID = 0; fieldID < semantics.questions.length; fieldID++) {

      const listener = new ISAACFieldListener(contentID, fieldID, semantics.questions[fieldID].targets, semantics.backend, 'content');

      // question
      let question = semantics.questions[fieldID].question;
      if (!question.startsWith('<div>')) { question = `<div>${question}</div>`; }
      const questionWrapper = document.createElement('li');
      questionWrapper.classList.add('h5p-isaac-question-wrapper');
      questionWrapper.innerHTML = question.trim();
      questionWrapper.firstElementChild.setAttribute('id', `${contentID}_${fieldID}_question`);
      questionWrapper.firstElementChild.classList.add('h5p-isaac-question');

      // wrapper for input field and toggle buttons
      const inputWrapper = document.createElement('div');
      inputWrapper.setAttribute('id', `${contentID}_${fieldID}`);
      inputWrapper.classList.add('h5p-isaac-input-wrapper');

      // input text box
      const userInput = document.createElement('div');
      userInput.setAttribute('id', `${contentID}_${fieldID}_input`);
      userInput.setAttribute('autocomplete', 'disabled'); // 'off' for browsers other than Chrome?
      userInput.setAttribute('autocorrect', 'off');
      userInput.setAttribute('spellcheck', 'false');
      userInput.setAttribute('contenteditable', 'true'); // requires workaround to disable rich text
      userInput.classList.add('h5p-isaac-input');

      // set input text box with previously saved content state, if applicable
      userInput.textContent = previousState.responses ? previousState.responses[fieldID] : '';

      // behavior for input text box
      userInput.onfocus = () => userInput.parentElement.classList.add('h5p-isaac-input-wrapper-focus');
      userInput.onblur = () => userInput.parentElement.classList.remove('h5p-isaac-input-wrapper-focus');
      userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleInput(contentID, fieldID, userInput, listener);
        }
      });
      userInput.addEventListener('paste', (e) => {
        // disable rich text formatting when pasting formatted text
        // remove this listener when contenteditable='plaintext-only' is more widely supported
        // https://caniuse.com/?search=contenteditable%3D%22plaintext-only%22
        e.preventDefault();
        const index = window.getSelection().getRangeAt(0).startOffset;
        const start = userInput.textContent.substr(0, index);
        const end = userInput.textContent.substr(index, userInput.textContent.length);
        const clipboardText = e.clipboardData.getData('text/plain');
        userInput.textContent = `${start}${clipboardText}${end}`;
        // reposition cursor after pasting (default behavior positions cursor at index 0)
        const setpos = document.createRange();
        const set = window.getSelection();
        setpos.setStart(userInput.childNodes[0], index + clipboardText.length);
        setpos.collapse(true);
        set.removeAllRanges();
        set.addRange(setpos);
        userInput.focus();
        // TODO does not overwrite selected text
        // TODO preserve input highlighting (if present); toggleInputHighlight is currently inverted on paste
      });

      // input button
      const enterButton = document.createElement('button');
      enterButton.setAttribute('id', `${contentID}_${fieldID}_submit`);
      enterButton.classList.add('h5p-isaac-button', 'h5p-isaac-input-button', 'h5p-isaac-enter', 'tooltip');
      const enterTooltipText = document.createElement('span');
      enterTooltipText.classList.add('tooltiptext');
      enterTooltipText.innerText = 'Get Feedback'; // TODO: get localized text (from semantics?)
      // enterButton.appendChild(enterTooltipText);

      // behavior for input button
      enterButton.addEventListener('click', () => { handleInput(contentID, fieldID, enterButton, listener); });

      // feedback toggle button
      const feedbackButton = document.createElement('button');
      feedbackButton.setAttribute('id', `${contentID}_${fieldID}_feedback_button`);
      feedbackButton.classList.add('h5p-isaac-button', 'h5p-isaac-feedback-button', 'h5p-isaac-hidden', 'tooltip');
      const feedbackTooltipText = document.createElement('span');
      feedbackTooltipText.classList.add('tooltiptext');
      feedbackTooltipText.innerText = 'Show Feedback'; // TODO: get localized text (from semantics?)
      // feedbackButton.appendChild(feedbackTooltipText);

      // passage highlight toggle button
      const infoButton = document.createElement('button');
      infoButton.setAttribute('id', `${contentID}_${fieldID}_info`);
      infoButton.classList.add('h5p-isaac-button', 'h5p-isaac-info', 'h5p-isaac-hidden', 'tooltip');
      const infoTooltipText = document.createElement('span');
      infoTooltipText.classList.add('tooltiptext');
      infoTooltipText.innerText = 'Show context'; // TODO: get localized text (from semantics?)
      // infoButton.appendChild(infoTooltipText);

      // pop-up container
      const popup = document.createElement('div');
      popup.setAttribute('id', `${contentID}_${fieldID}_popup`);
      popup.classList.add('h5p-isaac-popup', 'h5p-isaac-popup-collapsed');
      const popupText = document.createElement('div');
      popupText.classList.add('h5p-isaac-popup-text', 'h5p-isaac-hidden');
      popup.appendChild(popupText);

      // popup yes/no buttons
      const yes = document.createElement('button');
      yes.setAttribute('id', `${contentID}_${fieldID}_yes`);
      yes.classList.add('h5p-isaac-popup-button', 'h5p-isaac-popup-button-yes', 'h5p-isaac-hidden');
      const no = document.createElement('button');
      no.setAttribute('id', `${contentID}_${fieldID}_no`);
      no.classList.add('h5p-isaac-popup-button', 'h5p-isaac-popup-button-no', 'h5p-isaac-hidden');
      popup.appendChild(yes);
      popup.appendChild(no);

      inputWrapper.appendChild(userInput);
      inputWrapper.appendChild(enterButton);
      questionWrapper.appendChild(inputWrapper);
      questionWrapper.appendChild(feedbackButton);
      questionWrapper.appendChild(infoButton);
      questionWrapper.appendChild(popup);
      ol.appendChild(questionWrapper);
    }

    // add Q&A section to DOM
    this.content.appendChild(ol);

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => { return this.content; };
  }
}
