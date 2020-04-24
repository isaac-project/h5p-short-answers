// Import required classes
import ISAACContent from './h5p-isaac-content';

import { ISAACTask, uploadTask } from './h5p-isaac-interaction';

const UPLOAD_TASK_DATA = true;
/**
 * Class holding a full ISAAC example.
 *
 * - Extends H5P.Question which offers functions for setting the DOM
 * - Implements the question type contract necessary for reporting and for
 *   making the content type usable in compound content types like Question Set
 *   Cpm. https://h5p.org/documentation/developers/contracts
 * - Implements getCurrentState to allow continuing a user's previous session
 * - Uses a separate content class to organitze files
 */
export default class ISAAC extends H5P.Question {
  /**
   * @constructor
   *
   * @param {object} params Parameters passed by the editor.
   * @param {number} contentId Content's id.
   * @param {object} [extras] Saved state, metadata, etc.
   */
  constructor(params, contentId, extras = {}) {
    super('isaac'); // CSS class selector for content's iframe: h5p-isaac

    // upload task to server
    if (UPLOAD_TASK_DATA) {
      const serverTaskContent = H5PIntegration.contents["cid-" + contentId];
      const isaacTask = new ISAACTask(H5PIntegration.baseUrl,
        contentId,
        serverTaskContent.metadata.title,
        serverTaskContent.library,
        params);
      uploadTask(isaacTask);
    }

    this.params = params;
    this.contentId = contentId;
    this.extras = extras;

    /*
     * this.params.behaviour.enableSolutionsButton and this.params.behaviour.enableRetry
     * are used by H5P's question type contract.
     */

    // Make sure all variables are set
    this.params = extend({
      behaviour: {
        enableSolutionsButton: true,
        enableRetry: true
      },
      l10n: {
        checkAnswer: 'Check answer',
        showSolution: 'Show solution',
        tryAgain: 'Retry'
      }
    }, this.params);

    // this.previousState now holds the saved content state of the previous session
    this.previousState = this.extras.previousState || {};

    /**
     * Register the DOM elements with H5P.Question
     */
    this.registerDomElements = () => {

      // setImage and setVideo are H5P functions that seem to put media before all other content
      if (this.params.media) { //  && media.type && media.type.library
        var media = this.params.media;
        var type = media.library.split(' ')[0];
        if ((type === 'H5P.Image') && (media.params.file)) {
          this.setImage(media.params.file.path, {
            disableImageZooming: this.params.media.disableImageZooming || true,
            alt: media.params.alt,
            title: media.params.title
          });
        }
        else if ((type === 'H5P.Video') && (media.params.sources)) {
          this.setVideo(media);
        }
      }
      const content = new ISAACContent(
        this.params.task,
        this.params.passage,
        this.params.questions,
        this.contentId
        //this.previousState.random // previous session state
      );

      // Register content with H5P.Question
      this.setContent(content.getDOM());

      // Register Buttons
      this.addButtons();

      /*
       * H5P.Question also offers some more functions that could be used.
       * Consult https://github.com/h5p/h5p-question for details
       */
    };

    /**
     * Add all the buttons that shall be passed to H5P.Question.
     */
    this.addButtons = () => {

      this.addButton('check-answer', this.params.l10n.checkAnswer, () => {

        this.getScore();

      }, true, {}, {});

      this.addButton('show-solution', this.params.l10n.showSolution, () => {

        this.showSolutions();

      }, false, {}, {});

      this.addButton('try-again', this.params.l10n.tryAgain, () => {

        this.resetTask();

      }, false, {}, {});
    };

    /**
     * Check if result has been submitted or input has been given.
     *
     * @return {boolean} True, if answer was given.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
     */
    this.getAnswerGiven = () => false; // TODO: Return your value here

    /**
     * Get latest score.
     *
     * @return {number} latest score.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
     */
    this.getScore = () => {

      console.log('"Check" button clicked!');

      for (var i = 0; i < this.params.questions.length; i++) {
        console.log(document.getElementsByName(i).item(0).value);
      }

      this.hideButton('check-answer');

      if (this.params.behaviour.enableSolutionsButton) {
        this.showButton('show-solution');
      }

      if (this.params.behaviour.enableRetry) {
        this.showButton('try-again');
      }

      return 0;
    };

    /**
     * Get maximum possible score.
     *
     * @return {number} Score necessary for mastering.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
     */
    this.getMaxScore = () => 0; // TODO: Return real maximum score here

    /**
     * Show solutions.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
     */
    this.showSolutions = () => {

      console.log('"Show solution" button clicked!');

      for (var i = 0; i < this.params.questions.length; i++) {
        // certain characters are escaped (Character Entity References)
        var answer = document.createElement("textarea");
        answer.innerHTML = this.params.questions[i].targets[0];
        document.getElementsByName(i).item(0).value = answer.value;
      }

      this.trigger('resize');
    };

    /**
     * Reset task.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    this.resetTask = () => {

      console.log('"Retry" button clicked!');

      this.showButton('check-answer');
      this.hideButton('show-solution');
      this.hideButton('try-again');

      for (var i = 0; i < this.params.questions.length; i++) {
        document.getElementsByName(i).item(0).value = '';
      }

      this.trigger('resize');
    };

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
    this.getDescription = () => this.params.taskDescription || ISAAC.DEFAULT_DESCRIPTION;

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
      /*
       * TODO: Return any data object that will indicate the state that should
       * be loaded on start, here it's a random number
       */
      return {
        random: Math.random(100)
      };


    };
  }
}

/** @constant {string} */
ISAAC.DEFAULT_DESCRIPTION = 'Hello World';
