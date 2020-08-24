import { ISAACFieldListener } from './h5p-isaac-interaction';

export default class ISAACContent {
  /**
   * @constructor
   * @param task {string} Brief description of how to complete the task
   * @param passage {string} Text upon which questions are based (max 10,000 chars)
   * @param questions {array} List of pairs of question and target answer(s)
   * @param contentID {number} Integer representing the content ID
   * @param backend {string}
   */
  constructor(task, passage, questions, contentID, backend) {

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
      const replacement = `<span id='${contentID}_mark_$1' class='h5p-isaac-highlight h5p-isaac-hidden'>$2</span>`;
      passageNode.innerHTML = `${template.innerHTML.replace(/(\d+)\*\*(.*?)\*\*/gi, replacement)}`;
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

      // wrapper for input field and icons
      const wrapper = document.createElement('span');
      wrapper.setAttribute("id", contentID + "_" + i);
      wrapper.setAttribute('class', 'h5p-input-wrapper');

      // create input text box
      const userInput = document.createElement("input");
      userInput.classList.add("h5p-isaac-input");

      // register input handler
      const listener = new ISAACFieldListener(contentID, i, questions[i].targets, backend);
      userInput.addEventListener("keydown", function (e) {
        if (e.key === 'Enter')
          listener.handleEvent(e);
      });

      // information bubble
      const info = document.createElement('span');
      info.setAttribute('id', contentID + "_" + i + "_info");
      info.setAttribute('class', 'h5p-isaac-info');
      info.addEventListener("click", function (e) {
        const target = document.getElementById(`${contentID}_mark_${i + 1}`);
        if (target !== null) {
          target.scrollIntoView({ // may not be supported by Safari and iOS (?)
            behavior: 'smooth',
            block: 'center'
          });
        }
      });

      // add question and text box to Q&A section
      wrapper.appendChild(userInput);
      nodeQA.appendChild(wrapper);
      nodeQA.appendChild(info);
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

export function displayIncorrect(contentID, fieldID, feedback) {
  "use strict";

  // automatically scroll to highlight only if outside viewport
  // const target = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
  // if (target !== null && target.getBoundingClientRect().top < 0 && target.getBoundingClientRect().bottom < 0) {
  //   target.scrollIntoView({ // may not be supported by Safari and iOS (?)
  //     behavior: 'smooth',
  //     block: 'center'
  //   })
  // }

  // underline incorrect input fields
  const wrapper = document.getElementById(contentID + "_" + fieldID);
  wrapper.classList.remove("h5p-input-correct");
  wrapper.classList.add("h5p-input-incorrect");
  const input = wrapper.firstElementChild;
  input.classList.remove("h5p-isaac-correct"); // answer has been changed; remove correct label
  input.classList.add("h5p-isaac-incorrect"); // highlight with red underline
  // input.addEventListener('focus', () => input.classList.remove("h5p-isaac-incorrect"), false);

  // highlight relevant text in passage
  const highlight = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
  if (highlight !== null) {
    highlight.classList.remove("h5p-isaac-hidden");
  }

  // display info bubble
  const info = document.getElementById(`${contentID}_${fieldID}_info`);
  info.classList.add('h5p-isaac-info-show');

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

export function displayCorrect(contentID, fieldID) {
  "use strict";
  const wrapper = document.getElementById(contentID + "_" + fieldID);
  wrapper.classList.remove("h5p-input-incorrect");
  wrapper.classList.add("h5p-input-correct");
  const input = wrapper.firstElementChild;
  input.classList.remove("h5p-isaac-incorrect"); // remove red underline (if present)
  input.classList.add("h5p-isaac-correct"); // highlight with green underline

  // hide info bubble
  const info = document.getElementById(`${contentID}_${fieldID}_info`);
  info.classList.remove('h5p-isaac-info-show');

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

export function resetHighlights(contentID, targets) {
  "use strict";
  // remove existing highlight (if present)
  for (let i = 0; i < targets.length; i++) {
    const passageHighlights = document.getElementById(`${contentID}_mark_${i + 1}`);
    if (passageHighlights !== null) {
      passageHighlights.classList.add("h5p-isaac-hidden");
    }
  }
}
