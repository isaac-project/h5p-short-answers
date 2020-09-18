import { ISAACFieldListener } from './interaction';

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

export function displaySuggestion(contentID, fieldID, targets, backend, suggestion) {
    'use strict';
    const popup = document.getElementById(`${contentID}_${fieldID}_popup`);
    popup.firstElementChild.innerHTML = `Did you mean: <b><i>${suggestion.text}</i></b>`;

    changeColor('orange', 'input', document.getElementById(`${contentID}_${fieldID}`));
    togglePassageHighlights(contentID, -1, 'hide');
    toggleQAHighlights(contentID, fieldID, {}, 'question', 'hide');
    toggleQAHighlights(contentID, fieldID, {}, 'input', 'hide');
    toggleCheckmark(contentID, fieldID, 'hide');
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_feedback_button`));
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_info`));
    toggleYN(contentID, fieldID, suggestion, targets, backend, 'show');
    togglePopup(contentID, fieldID, 'orange', 'expand');
}

export function displayIncorrect(contentID, fieldID, feedback) {
    'use strict';
    const popup = document.getElementById(`${contentID}_${fieldID}_popup`);
    popup.firstElementChild.innerText = feedback.feedbackString;

    const feedbackButton = document.getElementById(`${contentID}_${fieldID}_feedback_button`);
    feedbackButton.onclick = () => {
        toggleQAHighlights(contentID, fieldID, feedback, 'question', 'toggle');
        toggleQAHighlights(contentID, fieldID, feedback, 'input', 'toggle');
        togglePopup(contentID, fieldID, 'red', 'toggle');
        feedbackButton.blur();
    };

    // only show info button if there is a corresponding passage highlight
    const passageHighlight = document.getElementById(`${contentID}_${fieldID + 1}_mark`);
    if (passageHighlight !== null) {
        const infoButton = document.getElementById(`${contentID}_${fieldID}_info`);
        infoButton.onclick = () => {
            togglePassageHighlights(contentID, -1, 'hide');
            togglePassageHighlights(contentID, fieldID, 'show');
            passageHighlight.scrollIntoView({
                behavior: 'smooth', // not supported by Safari and iOS
                block: 'center'
            });
            infoButton.blur();
        };
        toggleButton(contentID, fieldID, 'show', document.getElementById(`${contentID}_${fieldID}_info`));
    }

    changeColor('red', 'input', document.getElementById(`${contentID}_${fieldID}`));
    togglePassageHighlights(contentID, -1, 'hide');
    toggleQAHighlights(contentID, fieldID, {}, 'question', 'hide');
    toggleCheckmark(contentID, fieldID, 'hide');
    toggleButton(contentID, fieldID, 'show', document.getElementById(`${contentID}_${fieldID}_feedback_button`));
    togglePopup(contentID, fieldID, '', 'collapse');
}

export function displayCorrect(contentID, fieldID) {
    'use strict';
    changeColor('green', 'input', document.getElementById(`${contentID}_${fieldID}`));
    togglePassageHighlights(contentID, fieldID, 'hide');
    toggleQAHighlights(contentID, fieldID, {}, 'question', 'hide');
    toggleCheckmark(contentID, fieldID, 'show');
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_feedback_button`));
    toggleButton(contentID, fieldID, 'hide', document.getElementById(`${contentID}_${fieldID}_info`));
    togglePopup(contentID, fieldID, 'green', 'collapse');
}

export function togglePassageHighlights(contentID, fieldID, action) {
    'use strict';
    const highlightNumber = fieldID++; // content author counts from 1 when inserting highlight
    const highlight = document.getElementById(`${contentID}_${highlightNumber}_mark`);
    if (action === 'hide') {
        if (fieldID > 0 && highlight !== null) {
            highlight.classList.add('h5p-isaac-highlight-hidden');
        } else { // remove any and all passage highlights
            for (let i = 0; i < document.getElementById(`${contentID}_questions`).childElementCount; i++) {
                const passageHighlights = document.getElementById(`${contentID}_${i + 1}_mark`);
                if (passageHighlights !== null) { passageHighlights.classList.add('h5p-isaac-highlight-hidden'); }
            }
        }
    } else if (action === 'show' && highlight !== null && highlight.classList.contains('h5p-isaac-highlight-hidden')) {
        highlight.classList.remove('h5p-isaac-highlight-hidden');
    }
}

/**
 *
 * @param contentID
 * @param fieldID
 * @param feedback
 * @param type {'input', 'question'}
 * @param action
 */
export function toggleQAHighlights(contentID, fieldID, feedback, type, action) {
    'use strict';
    const element = document.getElementById(`${contentID}_${fieldID}_${type}`);
    const highlight = document.getElementById(`${contentID}_${fieldID}_${type}_highlight`);

    if (action === 'hide' || (action === 'toggle' && highlight !== null)) {
        // double quotes required for regex to work!
        const highlightPattern = new RegExp(
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

export function toggleButton(contentID, fieldID, action, element) {
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
    }
}

export function togglePopup(contentID, fieldID, color, action) {
    'use strict';
    const popup = document.getElementById(`${contentID}_${fieldID}_popup`);
    changeColor(color, 'popup', popup);
    if (action === 'expand' || (action === 'toggle' && popup.classList.contains('h5p-isaac-popup-collapsed'))) {
        popup.classList.remove('h5p-isaac-popup-collapsed');
        popup.classList.add('h5p-isaac-popup-expand');
        popup.firstElementChild.classList.remove('h5p-isaac-hidden');
    } else if (action === 'collapse' || (action === 'toggle' && popup.classList.contains('h5p-isaac-popup-expand'))) {
        popup.classList.add('h5p-isaac-popup-collapsed');
        popup.classList.remove('h5p-isaac-popup-expand');
        setTimeout(() => {
            popup.firstElementChild.classList.add('h5p-isaac-hidden');
            document.getElementById(`${contentID}_${fieldID}_yes`).classList.add('h5p-isaac-hidden');
            document.getElementById(`${contentID}_${fieldID}_no`).classList.add('h5p-isaac-hidden');
        }, 250); // ms; 0.25 seconds
    }
}

export function toggleYN(contentID, fieldID, suggestion, targets, backend, action) {
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
            togglePopup(contentID, fieldID, '', 'collapse');
            setTimeout(() => {
                const listener = new ISAACFieldListener(contentID, fieldID, targets, backend, 'final');
                listener.handleEvent(answer.textContent);
            }, 250); // ms; 0.25 seconds
            thumbsUp.blur();
        };
        thumbsDown.classList.remove('h5p-isaac-hidden');
        thumbsDown.onclick = () => {
            togglePopup(contentID, fieldID, '', 'collapse');
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
 *
 * @param color
 * @param type {'input', 'popup'}
 * @param element
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
