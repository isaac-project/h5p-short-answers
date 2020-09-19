import { ISAACFieldListener } from './interaction';

/**
 * Pass user input from the front-end to backend using the specified event listener
 *
 * @param contentID
 * @param fieldID
 * @param element Either: user input text box or the enter button
 * @param listener ISAACFieldListener
 */
export function handleInput(contentID, fieldID, element, listener) {
    'use strict';
    const inputField = document.getElementById(`${contentID}_${fieldID}_input`);
    if (inputField.textContent.trim()) { // ignore empty input
        // TODO only execute if answer differs from previous. store answer?
        inputField.textContent = inputField.textContent.trim();
        listener.handleEvent(document.getElementById(`${contentID}_${fieldID}_input`).textContent);
        element.blur();
    }
}

/**
 * Preliminary behavior, if applicable, for suggesting error corrections before evaluation and feedback delivery
 *
 * @param contentID
 * @param fieldID
 * @param targets Correct answers for this question/prompt as defined by content author (semantics.questions[i].targets)
 * @param backend
 * @param suggestion Object containing the proposed correction from the backend
 */
export function displaySuggestion(contentID, fieldID, targets, backend, suggestion) {
    'use strict';
    changeColor('orange', 'input', document.getElementById(`${contentID}_${fieldID}`));
    populatePopup(contentID, fieldID, document.getElementById(`${contentID}_${fieldID}_popup`), suggestion, 'suggestion');
    togglePassageHighlights(contentID, -1, 'hide');
    toggleQAHighlights(contentID, fieldID, 'hide', {}, 'question');
    toggleQAHighlights(contentID, fieldID, 'hide', {}, 'input');
    toggleCheckmark(contentID, fieldID, 'hide');
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_feedback_button`), {}, 'feedback');
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_info`), {}, 'passage');
    toggleYN(contentID, fieldID, 'show', suggestion, targets, backend);
    togglePopup(contentID, fieldID, 'show', 'orange');
}

/**
 * Behavior when user input is incorrect and feedback is propagated from the backend
 *
 * @param contentID
 * @param fieldID
 * @param feedback Object containing the feedback text, question/prompt highlight indices, and input highlight indices
 */
export function displayIncorrect(contentID, fieldID, feedback) {
    'use strict';
    changeColor('red', 'input', document.getElementById(`${contentID}_${fieldID}`));
    populatePopup(contentID, fieldID, document.getElementById(`${contentID}_${fieldID}_popup`), feedback, 'feedback');
    togglePassageHighlights(contentID, -1, 'hide');
    toggleQAHighlights(contentID, fieldID, {}, 'question', 'hide');
    toggleCheckmark(contentID, fieldID, 'hide');
    toggleButton(contentID, fieldID, 'show', document.getElementById(`${contentID}_${fieldID}_feedback_button`), feedback, 'feedback');
    togglePopup(contentID, fieldID, 'hide', '');

    // only show info button if there is a corresponding passage highlight
    const correspondingQuestionNumber = fieldID + 1; // passage highlights are defined by content author; indexed from 1
    if (document.getElementById(`${contentID}_${correspondingQuestionNumber}_mark`) !== null) {
        toggleButton(contentID, fieldID, 'show', document.getElementById(`${contentID}_${fieldID}_info`), feedback, 'passage');
    }
}

/**
 * Behavior when user input is correct
 *
 * @param contentID
 * @param fieldID
 */
export function displayCorrect(contentID, fieldID) {
    'use strict';
    changeColor('green', 'input', document.getElementById(`${contentID}_${fieldID}`));
    togglePassageHighlights(contentID, fieldID, 'hide');
    toggleQAHighlights(contentID, fieldID, 'hide', {}, 'question');
    toggleCheckmark(contentID, fieldID, 'show');
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_feedback_button`), {}, 'feedback');
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_info`), {}, 'passage');
    togglePopup(contentID, fieldID, 'hide', 'green');
}

/**
 * Show/hide passage highlights
 * If an integer >= 1 is provided, only remove the passage highlight for that corresponding question/prompt
 * If an integer < 0 is provided, remove any and all passage highlights to either:
 *     - reset task
 *     - prepare for highlighting another passage snippet (passage should not have more than one snippet highlighted)
 *
 * @param contentID
 * @param fieldID
 * @param action {'show', 'hide'}
 */
export function togglePassageHighlights(contentID, fieldID, action) {
    'use strict';
    const correspondingQuestionNumber = fieldID + 1; // content author counts from 1 when inserting highlight
    const highlight = document.getElementById(`${contentID}_${correspondingQuestionNumber}_mark`);
    if (action === 'hide') {
        if (fieldID > 0 && highlight !== null) { // remove specific passage highlight
            highlight.classList.add('h5p-isaac-highlight-hidden');
        } else { // remove any and all passage highlights
            for (let i = 1; i < document.getElementById(`${contentID}_questions`).childElementCount; i++) {
                const passageHighlights = document.getElementById(`${contentID}_${i}_mark`);
                if (passageHighlights !== null) { passageHighlights.classList.add('h5p-isaac-highlight-hidden'); }
            }
        }
    } else if (action === 'show' && highlight !== null && highlight.classList.contains('h5p-isaac-highlight-hidden')) {
        highlight.classList.remove('h5p-isaac-highlight-hidden');
    }
}

/**
 * Show/hide either:
 *     - the question (prompt) highlight
 *     - user input highlight
 *
 * @param contentID
 * @param fieldID
 * @param action {'show', 'hide', 'toggle'}
 * @param feedback
 * @param type {'input', 'question'}
 */
export function toggleQAHighlights(contentID, fieldID, action, feedback, type) {
    'use strict';
    const element = document.getElementById(`${contentID}_${fieldID}_${type}`);
    const highlight = document.getElementById(`${contentID}_${fieldID}_${type}_highlight`);

    if (action === 'hide' || (action === 'toggle' && highlight !== null)) {
        const highlightPattern = new RegExp( // double quotes required for regex to work!
            `<span id="\\d+_\\d+_${type}_highlight" class="h5p-isaac-highlight">|<\/span>`, "gi");
        element.innerHTML = `${element.innerHTML.replace(highlightPattern, '')}`;
    } else if (action === 'show' || (action === 'toggle' && highlight === null
        && feedback.questionHighlightStart && feedback.questionHighlightEnd)) {
        const start = element.innerText.substring(0, feedback.questionHighlightStart);
        const mark = element.innerText.substring(feedback.questionHighlightStart, feedback.questionHighlightEnd);
        const end = element.innerText.substring(feedback.questionHighlightEnd, element.innerText.length);
        const spanTag = `<span id= '${contentID}_${fieldID}_${type}_highlight' class='h5p-isaac-highlight'>`;
        element.innerHTML = `${start}${spanTag}${mark}</span>${end}`;
        // TODO (case: question) preserve existing HTML markup
        // TODO (case: input) reset highlight when input returns to focus?
    }
}

/**
 * Show/hide the green checkmark, depending on whether input state is correct
 *
 * @param contentID
 * @param fieldID
 * @param action {'show', 'hide'}
 */
export function toggleCheckmark(contentID, fieldID, action) {
    'use strict';
    const userInputButton = document.getElementById(`${contentID}_${fieldID}_submit`);
    if (action === 'hide') {
        userInputButton.classList.remove('h5p-isaac-check');
        userInputButton.classList.add('h5p-isaac-enter');
        // enterButton.firstElementChild.classList.remove('h5p-isaac-hidden'); // show 'Get Feedback' tooltip
    } else if (action === 'show') {
        userInputButton.classList.remove('h5p-isaac-enter');
        userInputButton.classList.add('h5p-isaac-check');
        // enterButton.firstElementChild.classList.add('h5p-isaac-hidden'); // hide 'Get Feedback' tooltip
    }
}

/**
 * Show/hide either:
 *     - the feedback button (speech bubble)
 *     - passage highlight button (i)
 *
 * @param contentID
 * @param fieldID
 * @param action {'show', 'hide'}
 * @param element Button DOM element
 * @param feedback Object containing the feedback text, question/prompt highlight indices, and input highlight indices
 * @param type {'feedback', 'passage'}
 */
export function toggleButton(contentID, fieldID, action, element, feedback, type) {
    'use strict';
    if (action === 'hide') {
        element.classList.remove('h5p-isaac-button-show');
        element.classList.add('h5p-isaac-button-hide');
        setTimeout(() => {
            element.classList.add('h5p-isaac-hidden');
        }, 250); // ms; 0.25 seconds
    } else if (action === 'show') {
        element.classList.add('h5p-isaac-button-show');
        element.classList.remove('h5p-isaac-hidden', 'h5p-isaac-button-hide');
        if (type === 'feedback') {
            element.onclick = () => {
                toggleQAHighlights(contentID, fieldID, 'toggle', feedback, 'question');
                toggleQAHighlights(contentID, fieldID, 'toggle', feedback, 'input');
                togglePopup(contentID, fieldID, 'toggle', 'red');
                element.blur();
            };
        } else if (type === 'passage') {
            const correspondingQuestionNumber = fieldID + 1;  // number defined by content author; indexed from 1
            const passageHighlight = document.getElementById(`${contentID}_${correspondingQuestionNumber}_mark`);
            element.onclick = () => {
                togglePassageHighlights(contentID, -1, 'hide');
                togglePassageHighlights(contentID, fieldID, 'show');
                passageHighlight.scrollIntoView({
                    behavior: 'smooth', // not supported by Safari and iOS
                    block: 'center'
                });
                element.blur();
            };
        }
    }
}

/**
 * Show/hide the popup container
 *
 * @param contentID
 * @param fieldID
 * @param action {'hide', 'show', 'toggle'}
 * @param color
 */
export function togglePopup(contentID, fieldID, action, color) {
    'use strict';
    const popup = document.getElementById(`${contentID}_${fieldID}_popup`);
    changeColor(color, 'popup', popup);
    if (action === 'show' || (action === 'toggle' && popup.classList.contains('h5p-isaac-popup-collapsed'))) {
        popup.classList.remove('h5p-isaac-popup-collapsed');
        popup.classList.add('h5p-isaac-popup-expand');
        popup.firstElementChild.classList.remove('h5p-isaac-hidden'); // text content
    } else if (action === 'hide' || (action === 'toggle' && popup.classList.contains('h5p-isaac-popup-expand'))) {
        popup.classList.add('h5p-isaac-popup-collapsed');
        popup.classList.remove('h5p-isaac-popup-expand');
        setTimeout(() => {
            popup.firstElementChild.classList.add('h5p-isaac-hidden'); // text content
            document.getElementById(`${contentID}_${fieldID}_yes`).classList.add('h5p-isaac-hidden');
            document.getElementById(`${contentID}_${fieldID}_no`).classList.add('h5p-isaac-hidden');
        }, 250); // ms; 0.25 seconds
    }
}

/**
 * Show/hide the yes/no buttons in popup
 *
 * @param contentID
 * @param fieldID
 * @param action {'show', 'hide', 'toggle'}
 * @param suggestion Object containing the proposed correction from the backend
 * @param targets Correct answers for this question/prompt as defined by content author (semantics.questions[i].targets)
 * @param backend
 */
export function toggleYN(contentID, fieldID, action, suggestion, targets, backend) {
    'use strict';
    const thumbsUp = document.getElementById(`${contentID}_${fieldID}_yes`);
    const thumbsDown = document.getElementById(`${contentID}_${fieldID}_no`);
    if (action === 'show' || (action === 'toggle'
        && thumbsUp.classList.contains('h5p-isaac-hidden') && thumbsDown.classList.contains('h5p-isaac-hidden'))) {
        thumbsUp.classList.remove('h5p-isaac-hidden');
        thumbsUp.onclick = () => {
            // replace input field with updated suggestion
            const answer = document.getElementById(`${contentID}_${fieldID}_input`);
            answer.textContent = suggestion.text;
            togglePopup(contentID, fieldID, 'hide','');
            setTimeout(() => {
                const listener = new ISAACFieldListener(contentID, fieldID, targets, backend, 'final');
                listener.handleEvent(answer.textContent);
            }, 250); // ms; 0.25 seconds
            thumbsUp.blur();
        };
        thumbsDown.classList.remove('h5p-isaac-hidden');
        thumbsDown.onclick = () => {
            togglePopup(contentID, fieldID, 'hide', '');
            setTimeout(() => {
                const listener = new ISAACFieldListener(contentID, fieldID, targets, backend, 'final');
                listener.handleEvent(document.getElementById(`${contentID}_${fieldID}_input`).textContent);
            }, 250); // ms; 0.25 seconds
            thumbsDown.blur();
        };
    } else if (action === 'hide' || (action === 'toggle'
        && !thumbsUp.classList.contains('h5p-isaac-hidden') && !thumbsDown.classList.contains('h5p-isaac-hidden'))) {
        document.getElementById(`${contentID}_${fieldID}_yes`).classList.add('h5p-isaac-hidden');
        document.getElementById(`${contentID}_${fieldID}_no`).classList.add('h5p-isaac-hidden');
    }
}

/**
 * Update either:
 *     - popup color
 *     - input field underline color
 *
 * @param color
 * @param type {'input', 'popup'}
 * @param element DOM element
 */
function changeColor(color, type, element) {
    'use strict';
    switch (color) {
        case ('green'):
            element.classList.remove(`h5p-isaac-${type}-incorrect`, `h5p-isaac-${type}-suggestion`);
            element.classList.add(`h5p-isaac-${type}-correct`);
            break;
        case ('orange'):
            element.classList.remove(`h5p-isaac-${type}-correct`, `h5p-isaac-${type}-incorrect`);
            element.classList.add(`h5p-isaac-${type}-suggestion`);
            break;
        case ('red'):
            element.classList.remove(`h5p-isaac-${type}-correct`, `h5p-isaac-${type}-suggestion`);
            element.classList.add(`h5p-isaac-${type}-incorrect`);
            break;
    }
}

/**
 * Insert text from backend response object into popup container
 *
 * @param contentID
 * @param fieldID
 * @param popup DOM element
 * @param responseObj Object returned by backend
 * @param type {'suggestion', 'feedback'}
 */
function populatePopup(contentID, fieldID, popup, responseObj, type) {
    'use strict';
    if (type === 'suggestion') {
        popup.firstElementChild.innerHTML = `Did you mean: <b><i>${responseObj.text}</i></b>`;
    } else if (type === 'feedback') {
        popup.firstElementChild.innerText = responseObj.feedbackString;
    }
}
