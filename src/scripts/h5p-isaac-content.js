import { ISAACFieldListener } from './h5p-isaac-interaction';

export default class ISAACContent {
  /**
   * @constructor
   * @param task {string} Brief description of how to complete the task
   * @param passage {string} Text upon which questions are based (max 10,000 chars)
   * @param questions {array} List of pairs of question and target answer(s, delimited by /)
   * @param contentID {number} Integer representing the content ID
   */
  constructor(task, passage, questions, contentID) {

    this.content = document.createElement('div');

    /*
     * Instructions, passage text, and questions can be formatted (bold, italics, etc.)
     * The entire item is returned as a <p> element, so in order to safely get the
     * innerHTML and place it in a new element we can modify (ex. with node.setAttribute())
     * we will use an HTML5 Template element as an intermediary
     */
    const template = document.createElement('template');

    // if task or passage are not modified/clicked on during setup, they won't be <p> elements
    if (!task.startsWith("<p>"))
      task = `<p>${task}</p>`;
    if (!passage.startsWith("<p>"))
      passage = `<p>${passage}</p>`;

    // task instructions
    template.innerHTML = task.trim();
    const taskNode = document.createElement('p');
    taskNode.classList.add("h5p-isaac-task");
    taskNode.innerHTML = `${template.innerHTML}`;
    this.content.appendChild(taskNode);

    // passage text
    if (passage.trim() !== '') {
      template.innerHTML = passage.trim();
      const passageNode = document.createElement("p");
      passageNode.setAttribute("id", contentID + "_passage");
      passageNode.classList.add("h5p-isaac-passage");
      passageNode.innerHTML = `${template.innerHTML}`;
      this.content.appendChild(passageNode);
    }

    // begin Q&A section
    const nodeQ = document.createElement('p');
    nodeQ.setAttribute("name", "h5p-isaac-questions");
    const ol = document.createElement('ol');
    ol.setAttribute("name", "h5p-isaac-list");

    for (let i = 0; i < questions.length; i++) {

      let question = questions[i].question;

      if (!question.startsWith("<p>"))
        question = `<p>${question}</p>`;

      // question text
      template.innerHTML = question.trim();
      const nodeQA = document.createElement('li');
      nodeQA.classList.add("h5p-isaac-question");
      nodeQA.innerHTML = `${template.innerHTML}`;

      // create input text box
      const userInput = document.createElement("input");
      userInput.classList.add("h5p-isaac-input");
      userInput.setAttribute("id", contentID + "_" + i);

      // register input handler
      const listener = new ISAACFieldListener(contentID, i, questions[i].targets);
      userInput.addEventListener("change", listener);

      // add question and text box to Q&A section
      nodeQA.appendChild(userInput);
      nodeQA.appendChild(document.createElement("br"));
      nodeQA.appendChild(document.createElement("br"));

      // pop-up container
      const modal = document.createElement('div');
      modal.setAttribute('class', 'modal');
      modal.setAttribute("id", contentID + "_" + i + "_modal");
      nodeQA.appendChild(modal);
      ol.appendChild(nodeQA);
    }

    // add Q&A section to DOM
    nodeQ.appendChild(ol);
    this.content.appendChild(nodeQ);

    /**
     * Return the DOM for this class.
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };
  }
}

export function populateAndShowPopup(contentID, fieldID, feedback) {
  "use strict";
  // retrieve pop-up container
  const popup = document.getElementById(contentID + "_" + fieldID + "_modal");

  // text content
  popup.innerHTML = '';
  const modal_content = document.createElement('p');
  modal_content.setAttribute('class', 'modal-content');
  modal_content.innerText = feedback.feedbackString;

  // upper-right close button
  const x = document.createElement('span');
  x.setAttribute('class', 'close');
  x.innerHTML = '&times;';
  modal_content.appendChild(x);

  // display pop-up
  popup.appendChild(modal_content);
  popup.style.display = "block";

  // close when user clicks x
  x.onclick = () => popup.style.display = "none";
}

export function highlightIncorrect(contentID, fieldID, feedback) {
  "use strict";
  // highlight incorrect input fields
  const input = document.getElementById(contentID + "_" + fieldID);
  input.classList.remove("h5p-isaac-correct"); // answer has been changed; remove correct label
  input.classList.add("h5p-isaac-incorrect"); // highlight with red underline
  // input.addEventListener('focus', () => input.classList.remove("h5p-isaac-incorrect"), false);

  // highlight start/end indices in passage
  if (feedback.highlightStart != null && feedback.highlightEnd != null) {

    // remove existing highlight (if present) in case user is getting feedback for a different question
    const passage = document.getElementById(contentID + "_passage");
    passage.innerHTML = passage.innerHTML.replace(/<\/?mark>/gi, '');

    // insert <mark></mark> tags into passage text
    let start = passage.innerText.substring(0, feedback.highlightStart);
    let mark = passage.innerText.substring(feedback.highlightStart, feedback.highlightEnd);
    let end = passage.innerText.substring(feedback.highlightEnd, passage.innerText.length);
    passage.innerHTML = `<p>${start}<mark>${mark}</mark>${end}</p>`;
  }
}

export function displayCorrect(contentID, fieldID) {
  "use strict";
  // remove passage highlight (if present)
  const passage = document.getElementById(contentID + "_passage");
  passage.innerHTML = passage.innerHTML.replace(/<\/?mark>/gi, '');

  const input = document.getElementById(contentID + "_" + fieldID);
  input.classList.remove("h5p-isaac-incorrect"); // remove red underline (if present)
  input.classList.add("h5p-isaac-correct"); // highlight with green underline

  // hide feedback popup
  const popup = document.getElementById(contentID + "_" + fieldID + "_modal");
  popup.classList.add('modal-fadeout');
  setTimeout(()=>{
    popup.style.display = "none";
    popup.classList.remove('modal-fadeout');
  },1000); // milliseconds = 1 second

  // disable input field when answer is correct
  // H5P.jQuery(input).attr('disabled', true);
}
