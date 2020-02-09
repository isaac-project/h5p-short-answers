/** Class representing the content */
export default class ISAACContent {
  /**
   * @constructor
   * @param task {string} Brief description of how to complete the task
   * @param passage {string} Text upon which questions are based (max 10,000 chars)
   * @param questions {array} List of pairs of question and target answer(s, delimited by /)
   */
  constructor(task, passage, questions) {
    this.content = document.createElement('div');
    this.content.setAttribute("id", "global");

    // task description/directions
    var nodeT = document.createElement('p');
    nodeT.setAttribute("id", "h5p-isaac-task");
    nodeT.appendChild(document.createTextNode(task));
    this.content.appendChild(nodeT);

    // passage text
    var nodeP = document.createElement('p');
    nodeP.setAttribute("id", "h5p-isaac-passage");
    //nodeP.appendChild(document.createTextNode(passage));
    nodeP.innerHTML = passage;
    this.content.appendChild(nodeP);

    // question & answer
    var nodeQ = document.createElement('p');
    nodeQ.setAttribute("id", "h5p-isaac-question");
    // begin numbered list
    var ol = document.createElement('ol');
    var nodeQ1 = document.createElement('li');
    nodeQ1.appendChild(document.createTextNode(questions[0]["question"]));
    ol.appendChild(nodeQ1);
    ol.appendChild(document.createTextNode("(Target answer: " + questions[0]["target"] + ")"));
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
