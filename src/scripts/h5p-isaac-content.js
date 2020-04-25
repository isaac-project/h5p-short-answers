import { ISAACFieldListener } from './h5p-isaac-interaction';

/** Class representing the content */
export default class ISAACContent {
  /**
   * @constructor
   * @param task {string} Brief description of how to complete the task
   * @param passage {string} Text upon which questions are based (max 10,000 chars)
   * @param questions {array} List of pairs of question and target answer(s, delimited by /)
   */
  constructor(task, passage, questions, contentId) {
    
    /*
     * Instructions/passage text/questions can be formatted (bold, italics, etc.)
     * The entire item is returned as a <p> element, so in order to get safely get the
     * innerHTML and place it in a new element we can modify (ex. node.setAttribute)
     * we will use an HTML5 Template element as an intermediary
     */
    let template = document.createElement('template');

    this.content = document.createElement('div');
    //this.content.setAttribute("id", "h5p-isaac-global");

    // instructions
    template.innerHTML = task.trim();
    let taskNode = document.createElement('p');
    taskNode.classList.add("h5p-isaac-task");
    taskNode.innerHTML = `${template.content.firstElementChild.innerHTML}`;
    this.content.appendChild(taskNode);

    // passage text
    if (passage.trim() !== '') {
      template.innerHTML = passage.trim();
      let passageNode = document.createElement("p");
      passageNode.classList.add("h5p-isaac-passage");
      passageNode.innerHTML = `${template.content.firstElementChild.innerHTML}`;
      this.content.appendChild(passageNode);
    }

    // begin question & answer
    let nodeQ = document.createElement('p');
    nodeQ.setAttribute("name", "h5p-isaac-questions");
    let ol = document.createElement('ol');
    ol.setAttribute("name", "h5p-isaac-list");


    for (let i = 0; i < questions.length; i++) {

      template.innerHTML = questions[i].question.trim();
      let nodeQA = document.createElement('li');
      nodeQA.classList.add("h5p-isaac-question");
      nodeQA.innerHTML = `${template.content.firstElementChild.innerHTML}`;
      nodeQA.appendChild(document.createElement("br"));
      let userInput = document.createElement("input");
      userInput.classList.add("h5p-isaac-input");
      userInput.setAttribute("id", contentId + "_" + i);
      // register input handler
      let listener = new ISAACFieldListener(contentId, i);
      userInput.addEventListener("change", listener);
      nodeQA.appendChild(userInput);
      nodeQA.appendChild(document.createElement("br"));
      nodeQA.appendChild(document.createElement("br"));
      ol.appendChild(nodeQA);
    }

    nodeQ.appendChild(ol);
    this.content.appendChild(nodeQ);

    /**
     * Return the DOM for this class.
     *
     * @return {HTMLElement} DOM for this class.
     */
    this.getDOM = () => {
      return this.content;
    };
  }
}
