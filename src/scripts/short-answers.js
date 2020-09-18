import ISAACContent from './content';
import { ISAACTask, uploadTask } from './interaction';
import { resetPassageHighlights, resetQuestionHighlights,
  toggleCheckmark, toggleFeedbackButton, toggleInfoButton, togglePopup } from './function';

const UPLOAD_TASK_DATA = true;

/**
 * - Extends H5P.Question which offers functions for setting the DOM
 * - Implements the question type contract necessary for reporting and for
 *   making the content type usable in compound content types like Question Set
 *   Cpm. https://h5p.org/documentation/developers/contracts
 * - Implements getCurrentState to allow continuing a user's previous session
 */
export default class ISAAC extends H5P.Question {
  /**
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

    // this.previousState now holds the saved content state of the previous session
    this.previousState = this.extras.previousState || {};

    /**
     * Register the DOM elements with H5P.Question
     */
    this.registerDomElements = () => {

      if (this.semantics.media) { // && media.type && media.type.library
        // TODO add support for more than one media instance?
        // TODO figure out how to position image before/after/within passage if desired by content author
        const media = this.semantics.media;
        const type = media.library.split(' ')[0];
        if ((type === 'H5P.Image') && (media.semantics.file)) {
          this.setImage(media.semantics.file.path, {
            disableImageZooming: this.semantics.media.disableImageZooming || true,
            alt: media.semantics.alt,
            title: media.semantics.title
          });
        }
        else if ((type === 'H5P.Video') && (media.semantics.sources)) {
          this.setVideo(media);
        }
      }

      // Register content with H5P.Question
      const content = new ISAACContent(
        this.semantics,
        this.contentID,
        this.previousState
      );
      this.setContent(content.getDOM());

      // Register Buttons
      this.addButtons();
    };

    /**
     * Add all the buttons that shall be passed to H5P.Question.
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

      // TODO add boolean flag in semantics, whether all questions must be attempted
      // if (!this.getAnswerGiven()) return;

      const maxScore = this.getMaxScore();
      const score = this.getScore();
      const scoreText = H5P.Question.determineOverallFeedback(this.semantics.overallFeedback, score / maxScore)
          .replace('@score', score).replace('@total', maxScore);
      this.setFeedback(scoreText, score, maxScore, this.semantics.scoreBarLabel);
    };

    /**
     * Check if result has been submitted or input has been given.
     * @return {boolean} True, if answer was given.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
     */
    this.getAnswerGiven = () => { return true; }

    /**
     * Get latest score.
     * @return {number} latest score.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
     */
    this.getScore = () => {

      this.hideButton('check-answer');

      // TODO define actual scoring mechanism
      let num_correct = 0;
      for (let i = 0; i < this.semantics.questions.length; i++) {
        const input = document.getElementById(`${contentID}_${i}_input`);
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
     * Get maximum possible score.
     * @return {number} Score necessary for mastering.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
     */
    this.getMaxScore = () => this.semantics.questions.length; // TODO: define question values in semantics?

    /**
     * Show solutions.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
     */
    this.showSolutions = () => {

      for (let i = 0; i < this.semantics.questions.length; i++) {
        // certain characters are escaped (Character Entity References)
        const answer = document.createElement('textarea');
        answer.innerHTML = this.semantics.questions[i].targets[0];

        const inputField = document.getElementById(`${contentID}_${i}_input`);
        if (!inputField.parentElement.classList.contains('h5p-isaac-input-correct')) {
          // only replace answers that have not already been marked correct
          inputField.textContent = answer.value;
        }

        toggleFeedbackButton(contentID, i, 'hide');
        toggleInfoButton(contentID, i, 'hide');
        togglePopup(contentID, i, '', 'collapse');
        resetPassageHighlights(contentID, i);
        resetQuestionHighlights(contentID, i);
      }
      this.hideButton('show-solution');
      this.trigger('resize');
    };

    /**
     * Reset task.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    this.resetTask = () => {

      for (let i = 0; i < this.semantics.questions.length; i++) {
        const input = document.getElementById(`${contentID}_${i}_input`);
        input.textContent = '';
        input.parentElement.setAttribute('class', 'h5p-isaac-input-wrapper');

        toggleCheckmark(contentID, i, false);
        toggleFeedbackButton(contentID, i, 'hide');
        toggleInfoButton(contentID, i, 'hide');
        togglePopup(contentID, i, '', 'collapse');
        resetPassageHighlights(contentID, i);
        resetQuestionHighlights(contentID, i);
      }
      this.showButton('check-answer');
      this.hideButton('show-solution');
      this.hideButton('try-again');
      this.removeFeedback(); // score bar
      this.trigger('resize');
    };

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Get xAPI data.
     *
     * @return {object} XAPI statement.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     */
    this.getXAPIData = () => ({
      statement: this.getXAPIAnswerEvent().data.statement
    });

    /**
     * Build xAPI answer event.
     *
     * @return {H5P.XAPIEvent} XAPI answer event.
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
     * Create an xAPI event for Dictation.
     *
     * @param {string} verb Short id of the verb we want to trigger.
     * @return {H5P.XAPIEvent} Event template.
     */
    this.createXAPIEvent = (verb) => {
      const xAPIEvent = this.createXAPIEventTemplate(verb);
      extend(
        xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
        this.getxAPIDefinition());
      return xAPIEvent;
    };

    /**
     * Get the xAPI definition for the xAPI object.
     *
     * @return {object} XAPI definition.
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
     * Determine whether the task has been passed by the user.
     *
     * @return {boolean} True if user passed or task is not scored.
     */
    this.isPassed = () => true;

    /**
     * Get tasks title.
     *
     * @return {string} Title.
     */
    this.getTitle = () => {
      let raw;
      if (this.extras.metadata) {
        raw = this.extras.metadata.title;
      }
      raw = raw || ISAAC.DEFAULT_DESCRIPTION;

      // H5P Core function: createTitle
      return H5P.createTitle(raw);
    };

    /**
     * Get tasks description.
     *
     * @return {string} Description.
     */
    // TODO: Have a field for a task description in the editor if you need one.
    this.getDescription = () => this.semantics.taskDescription || ISAAC.DEFAULT_DESCRIPTION;

    /**
     * Extend an array just like JQuery's extend.
     *
     * @param {object} arguments Objects to be merged.
     * @return {object} Merged objects.
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

    /**
     * Answer call to return the current state.
     *
     * @return {object} Current state.
     */
    this.getCurrentState = () => {
      const responses = [];
      for (let i = 0; i < this.semantics.questions.length; i++) {
        responses.push(document.getElementById(`${contentID}_${i}`).firstElementChild.textContent);
        // TODO also include underline color, text/prompt highlight, feedback popup if expanded, etc.?
      }
      return { responses: responses };
    };
  }
}

/** @constant {string} */
ISAAC.DEFAULT_DESCRIPTION = 'H5P Short Answers';
