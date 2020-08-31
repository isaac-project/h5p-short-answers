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
      wrapper.setAttribute('class', 'h5p-isaac-input-wrapper');

      // create input text box
      const userInput = document.createElement("input");
      userInput.setAttribute('id', `${contentID}_input_${i}`);
      userInput.classList.add("h5p-isaac-input");

      // create input button
      const button = document.createElement('button');
      button.classList.add('h5p-isaac-button', 'h5p-isaac-check', 'tooltip');
      button.setAttribute('id', `${contentID}_${i}_submit`)
      const buttonTooltipText = document.createElement('span');
      buttonTooltipText.classList.add('tooltiptext');
      buttonTooltipText.innerText = 'Evaluate.';
      button.appendChild(buttonTooltipText);

      // register input handler
      userInput.addEventListener("keydown", function (e) {
        if (e.key === 'Enter') {
          const answer = document.getElementById(`${contentID}_input_${i}`);
          const listener = new ISAACFieldListener(contentID, i, questions[i].targets, backend, answer.value);
          listener.handleEvent(answer.value);
        }
      });
      button.addEventListener("click", function (e) {
        const answer = document.getElementById(`${contentID}_input_${i}`);
        const listener = new ISAACFieldListener(contentID, i, questions[i].targets, backend, answer.value);
        listener.handleEvent(answer.value);
      });

      // information bubble
      const info = document.createElement('button');
      info.setAttribute('id', contentID + "_" + i + "_info");
      info.classList.add('h5p-isaac-button', 'h5p-isaac-info', 'tooltip');
      info.addEventListener("click", function (e) {
        const target = document.getElementById(`${contentID}_mark_${i + 1}`);
        if (target !== null) {
          target.scrollIntoView({ // may not be supported by Safari and iOS (?)
            behavior: 'smooth',
            block: 'center'
          });
        }
      });

      const infoTooltipText = document.createElement('span');
      infoTooltipText.classList.add('tooltiptext');
      infoTooltipText.innerText = 'Show context.';
      info.appendChild(infoTooltipText);

      // add question and text box to Q&A section
      wrapper.appendChild(userInput);
      wrapper.appendChild(button);
      wrapper.appendChild(info);
      nodeQA.appendChild(wrapper);

      // pop-up container
      const modal = document.createElement('div');
      modal.setAttribute('class', 'modal');
      modal.setAttribute("id", contentID + "_" + i + "_modal");
      nodeQA.appendChild(modal);

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
