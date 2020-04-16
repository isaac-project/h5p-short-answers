import { ISAACFieldListener, ISAACTask, uploadTask } from './h5p-isaac-interaction';

const UPLOAD_TASK_DATA = false;

/** Class representing the content */
export default class ISAACContent {
  /**
   * @constructor
   * @param task {string} Brief description of how to complete the task
   * @param passage {string} Text upon which questions are based (max 10,000 chars)
   * @param questions {array} List of pairs of question and target answer(s, delimited by /)
   */
  constructor(task, passage, questions, contentId) {
    
    // upload task to server
    if (UPLOAD_TASK_DATA) {
      const serverTaskContent = H5PIntegration.contents["cid-" + contentId];
      const isaacTask = new ISAACTask(H5PIntegration.baseUrl,
        contentId,
        serverTaskContent.metadata.title,
        serverTaskContent.library,
        serverTaskContent.jsonContent);
      console.log("Created task: " + JSON.stringify(isaacTask));
      uploadTask(isaacTask);
    }

    /*
     * Instructions/passage text/questions can be formatted (bold, italics, etc.)
     * The entire item is returned as a <p> element, so in order to get safely get the
     * innerHTML and place it in a new element we can modify (ex. node.setAttribute)
     * we will use an HTML5 Template element as an intermediary
     */
    var template = document.createElement('template');

    this.content = document.createElement('div');
    //this.content.setAttribute("id", "h5p-isaac-global");

    // instructions
    template.innerHTML = task.trim();
    var taskNode = document.createElement('p');
    taskNode.classList.add("h5p-isaac-task");
    taskNode.innerHTML = `${template.content.firstElementChild.innerHTML}`;
    this.content.appendChild(taskNode);

    // passage text
    if (passage.trim() !== '') {
      template.innerHTML = passage.trim();
      var passageNode = document.createElement("p");
      passageNode.classList.add("h5p-isaac-passage");
      passageNode.innerHTML = `${template.content.firstElementChild.innerHTML}`;
      this.content.appendChild(passageNode);
    }

    // begin question & answer
    var nodeQ = document.createElement('p');
    nodeQ.setAttribute("name", "h5p-isaac-questions");
    var ol = document.createElement('ol');
    ol.setAttribute("name", "h5p-isaac-list");


    for (var i = 0; i < questions.length; i++) {

      template.innerHTML = questions[i]["question"].trim();
      var nodeQA = document.createElement('li');
      nodeQA.classList.add("h5p-isaac-question");
      nodeQA.innerHTML = `${template.content.firstElementChild.innerHTML}`;
      nodeQA.appendChild(document.createElement("br"));
      var userInput = document.createElement("input");
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
