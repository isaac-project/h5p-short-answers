import ISAACContent from './content';
import { ISAACTask, uploadTask } from './interaction';
import { togglePassageHighlights, toggleQAHighlights, toggleCheckmark, toggleButton, togglePopup } from './function';

const UPLOAD_TASK_DATA = true;

/**
 * - Extends H5P.Question which offers functions for setting the DOM
 * - Implements the question type contract necessary for reporting and for
 *   making the content type usable in compound content types like Question Set
 *   Cpm. https://h5p.org/documentation/developers/contracts
 * - Implements getCurrentState to allow continuing a user's previous session
 */
export default class ShortAnswers extends H5P.Question {
  /**
   * Interface between H5P and DOM
   *
   * @constructor
   * @param semantics {object} Parameters defined in semantics.json, with "name" as key
   * @param contentID {number} Integer representing the content ID
   * @param [extras] {object} Saved state, metadata, etc.
   */
  constructor(semantics, contentID, extras = {}) {
    super('short-answers');

    // upload task to server
    if (UPLOAD_TASK_DATA) {
      const serverTaskContent = H5PIntegration.contents[`cid-${contentID}`];
      const isaacTask = new ISAACTask(location.hostname,
        contentID,
        serverTaskContent.metadata.title,
        serverTaskContent.library,
        semantics);
      uploadTask(isaacTask, semantics.backend);
    }

    this.semantics = semantics;
    this.contentID = contentID;
    this.extras = extras;

    // make sure all variables are set (used by H5P's question type) // TODO make sure this is complete and correct
    this.semantics = extend({
      overallFeedback: [],
      scoreBarLabel: 'You got :num out of :total points',
      behaviour: {
        enableSolutionsButton: true,
        enableRetry: true
      },
      l10n: {
        submitAnswer: 'Submit',
        showSolution: 'Show Solution',
        tryAgain: 'Retry'
      }
    }, this.semantics);

    // store content state of user's previous session
    this.previousState = this.extras.previousState || {};

    /**
     * Register the DOM elements with H5P.Question
     */
    this.registerDomElements = () => {

      // add media to DOM
      // TODO see if it's possible to do this in content.js
      // TODO see if there is a way to provide option to position media (before/after/within passage text; dropdown in semantics?)
      if (this.semantics.media) { // && media.type && media.type.library (are these necessary?)
        // TODO add support for more than one media instance (via semantics; is this even feasible?)
        const media = this.semantics.media;
        const type = media.library.split(' ')[0];
        if ((type === 'H5P.Image') && (media.params.file)) {
          this.setImage(media.params.file.path, {
            disableImageZooming: this.semantics.media.disableImageZooming || true,
            alt: media.params.alt,
            title: media.params.title
          });
        }
        else if ((type === 'H5P.Video') && (media.semantics.sources)) {
          this.setVideo(media);
        }
      }

      // register content with H5P.Question
      const content = new ISAACContent(this.semantics, this.contentID, this.previousState);
      this.setContent(content.getDOM());

      // register JoubelUI buttons
      this.addButtons();
    };

    /**
     * Add all the buttons that shall be passed to H5P.Question
     */
    this.addButtons = () => {
      this.addButton('check-answer', this.semantics.l10n.submitAnswer, () => this.showEvaluation(), true, {}, {});
      this.addButton('show-solution', this.semantics.l10n.showSolution, () => this.showSolutions(), false, {}, {});
      this.addButton('try-again', this.semantics.l10n.tryAgain, () => this.resetTask(), false, {}, {});
    };

    /**
     * Display/update animated score bar
     */
    this.showEvaluation = () => {

      // TODO add boolean flag in semantics, whether all questions must be attempted (?)
      // if (!this.getAnswerGiven()) return;

      const maxScore = this.getMaxScore();
      const score = this.getScore();
      const scoreText = H5P.Question.determineOverallFeedback(this.semantics.overallFeedback, score / maxScore)
          .replace('@score', score).replace('@total', maxScore);
      this.setFeedback(scoreText, score, maxScore, this.semantics.scoreBarLabel);
    };

    /**
     * Check if result has been submitted or input has been given
     * @return {boolean} True, if answer was given
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
     */
    this.getAnswerGiven = () => true; // TODO

    /**
     * Get latest score
     * @return {number} latest score
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
     */
    this.getScore = () => {

      this.hideButton('check-answer');

      // TODO define actual scoring mechanism
      let num_correct = 0;
      for (let fieldID = 0; fieldID < this.semantics.questions.length; fieldID++) {
        const input = document.getElementById(`${contentID}_${fieldID}_input`);
        if (input.parentElement.classList.contains('h5p-isaac-input-correct'))
          num_correct++;
      }
      if (num_correct !== this.getMaxScore() && this.semantics.behaviour.enableSolutionsButton) {
        this.showButton('show-solution');
      }
      if (this.semantics.behaviour.enableRetry) {
        this.showButton('try-again');
      }
      return num_correct;
    };

    /**
     * Get maximum possible score
     * @return {number} Score necessary for mastering
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
     */
    this.getMaxScore = () => this.semantics.questions.length; // TODO: define question values in semantics?

    /**
     * Show solutions
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
     */
    this.showSolutions = () => {

      for (let fieldID = 0; fieldID < this.semantics.questions.length; fieldID++) {
        // certain characters are escaped (Character Entity References)
        const answer = document.createElement('textarea');
        answer.innerHTML = this.semantics.questions[fieldID].targets[0];

        const inputField = document.getElementById(`${contentID}_${fieldID}_input`);
        if (!inputField.parentElement.classList.contains('h5p-isaac-input-correct')) {
          // only replace answers that have not already been marked correct
          inputField.textContent = answer.value;
        }

        togglePassageHighlights(contentID, fieldID, 'hide');
        toggleQAHighlights(contentID, fieldID, 'hide', {}, 'question');
        toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_feedback_button`), {}, 'feedback');
        toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_info`), {}, 'passage');
        togglePopup(contentID, fieldID, 'hide', '');
      }
      this.hideButton('show-solution');
      this.trigger('resize');
    };

    /**
     * Reset task
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    this.resetTask = () => {

      for (let fieldID = 0; fieldID < this.semantics.questions.length; fieldID++) {
        const input = document.getElementById(`${contentID}_${fieldID}_input`);
        input.textContent = '';
        input.parentElement.setAttribute('class', 'h5p-isaac-input-wrapper');

        togglePassageHighlights(contentID, fieldID, 'hide');
        toggleQAHighlights(contentID, fieldID, 'hide', {}, 'question');
        toggleCheckmark(contentID, fieldID, 'hide');
        toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_feedback_button`), {}, 'feedback');
        toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_info`), {}, 'passage');
        togglePopup(contentID, fieldID, 'hide', '');
      }
      this.showButton('check-answer');
      this.hideButton('show-solution');
      this.hideButton('try-again');
      this.removeFeedback(); // score bar
      this.trigger('resize');
    };

    /**
     * Determine whether the task has been passed by the user
     *
     * @return {boolean} True if user passed or task is not scored
     */
    this.isPassed = () => true; // TODO

    /**
     * Answer call to return the current state
     *
     * @return {object} Current state
     */
    this.getCurrentState = () => {
      const responses = [];
      for (let fieldID = 0; fieldID < this.semantics.questions.length; fieldID++) {
        responses.push(document.getElementById(`${contentID}_${fieldID}`).firstElementChild.textContent);
        // TODO also include underline color, text/prompt highlight, feedback popup if expanded, etc.?
      }
      return { responses: responses };
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get xAPI data
     *
     * @return {object} XAPI statement
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     */
    this.getXAPIData = () => ({
      statement: this.getXAPIAnswerEvent().data.statement
    });

    /**
     * Build xAPI answer event
     *
     * @return {H5P.XAPIEvent} XAPI answer event
     */
    this.getXAPIAnswerEvent = () => {
      const xAPIEvent = this.createXAPIEvent('answered');

      xAPIEvent.setScoredResult(this.getScore(), this.getMaxScore(), this,
        true, this.isPassed());

      /*
       * TODO: Add other properties here as required, e.g. xAPIEvent.data.statement.result.response
       * https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#245-result
       */

      return xAPIEvent;
    };

    /**
     * Create an xAPI event for Dictation
     *
     * @param {string} verb Short id of the verb we want to trigger
     * @return {H5P.XAPIEvent} Event template
     */
    this.createXAPIEvent = (verb) => {
      const xAPIEvent = this.createXAPIEventTemplate(verb);
      extend(
        xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
        this.getxAPIDefinition());
      return xAPIEvent;
    };

    /**
     * Get the xAPI definition for the xAPI object
     *
     * @return {object} XAPI definition
     */
    this.getxAPIDefinition = () => {
      const definition = {};
      definition.name = {'en-US': this.getTitle()};
      definition.description = {'en-US': this.getDescription()};

      // TODO: Set IRI as required for your verb, cmp. http://xapi.vocab.pub/verbs/#
      definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';

      // TODO: Set as required, cmp. https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#interaction-types
      definition.interactionType = 'other';

      /*
       * TODO: Add other object properties as required, e.g. definition.correctResponsesPattern
       * cmp. https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Data.md#244-object
       */

      return definition;
    };

    /**
     * Get tasks title
     *
     * @return {string} Title
     */
    this.getTitle = () => {
      let raw;
      if (this.extras.metadata) {
        raw = this.extras.metadata.title;
      }
      raw = raw || ShortAnswers.DEFAULT_DESCRIPTION;

      // H5P Core function: createTitle
      return H5P.createTitle(raw);
    };

    /**
     * Get tasks description.
     *
     * @return {string} Description.
     */
    // TODO: Have a field for a task description in the editor if you need one.
    this.getDescription = () => this.semantics.taskDescription || ShortAnswers.DEFAULT_DESCRIPTION;

    /**
     * Extend an array just like JQuery's extend
     *
     * @param {object} arguments Objects to be merged
     * @return {object} Merged objects
     */
    function extend() {
      for (let i = 1; i < arguments.length; i++) {
        for (let key in arguments[i]) {
          if (arguments[i].hasOwnProperty(key)) {
            if (typeof arguments[0][key] === 'object' && typeof arguments[i][key] === 'object') {
              extend(arguments[0][key], arguments[i][key]);
            }
            else {
              arguments[0][key] = arguments[i][key];
            }
          }
        }
      }
      return arguments[0];
    }
  }
}

/** @constant {string} */
ShortAnswers.DEFAULT_DESCRIPTION = 'H5P Short Answers';
