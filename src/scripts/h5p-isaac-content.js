import { ISAACFieldListener } from './h5p-isaac-interaction';

export default class ISAACContent {
  /**
   * @constructor
   * @param task {string} Brief description of how to complete the task
   * @param passage {string} Text upon which questions are based (max 10,000 chars)
   * @param questions {array} List of pairs of question and target answer(s, delimited by /)
   * @param contentId {number} Integer representing the content ID
   */
  constructor(task, passage, questions, contentId) {

    this.content = document.createElement('div');

    /*
     * Instructions, passage text, and questions can be formatted (bold, italics, etc.)
     * The entire item is returned as a <p> element, so in order to safely get the
     * innerHTML and place it in a new element we can modify (ex. with node.setAttribute())
     * we will use an HTML5 Template element as an intermediary
     */
    const template = document.createElement('template');

    // if task or passage are not clicked, they won't be <p> elements
    if (!task.startsWith("<p>")) task = `<p>${task}</p>`;
    if (!passage.startsWith("<p>")) passage = `<p>${passage}</p>`;

    template.innerHTML = task.trim();
    const taskNode = document.createElement('p');
    taskNode.classList.add("h5p-isaac-task");
    taskNode.innerHTML = `${template.content.firstElementChild.innerHTML}`;
    this.content.appendChild(taskNode);

    // passage text
    if (passage.trim() !== '') {
      template.innerHTML = passage.trim();
      const passageNode = document.createElement("p");
      passageNode.classList.add("h5p-isaac-passage");
      passageNode.innerHTML = `${template.content.firstElementChild.innerHTML}`;
      this.content.appendChild(passageNode);
    }

    // begin Q&A section
    const nodeQ = document.createElement('p');
    nodeQ.setAttribute("name", "h5p-isaac-questions");
    const ol = document.createElement('ol');
    ol.setAttribute("name", "h5p-isaac-list");

    for (let i = 0; i < questions.length; i++) {

      // question text
      template.innerHTML = questions[i].question.trim();
      const nodeQA = document.createElement('li');
      nodeQA.classList.add("h5p-isaac-question");
      nodeQA.innerHTML = `${template.content.firstElementChild.innerHTML}`;
      nodeQA.appendChild(document.createElement("br"));

      // create input text box
      const userInput = document.createElement("input");
      userInput.classList.add("h5p-isaac-input");
      userInput.setAttribute("id", contentId + "_" + i);

      // register input handler
      let listener = new ISAACFieldListener(contentId, i);
      userInput.addEventListener("change", listener);

      // add question and text box to Q&A section
      nodeQA.appendChild(userInput);
      nodeQA.appendChild(document.createElement("br"));
      nodeQA.appendChild(document.createElement("br"));
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
