import { ISAACFieldListener } from "./h5p-isaac-interaction";

export function displaySuggestion(contentID, fieldID, targets, backend, suggestion) {
    "use strict";
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup");
    popup.firstElementChild.innerHTML = `Did you mean: <b><i>${suggestion.text}</i></b>`;

    const thumbsUp = document.getElementById(`${contentID}_${fieldID}_yes`);
    thumbsUp.classList.remove('h5p-isaac-hidden');
    thumbsUp.onclick = () => {
        // replace input field with updated suggestion
        const answer = document.getElementById(`${contentID}_input_${fieldID}`);
        answer.textContent = suggestion.text;
        togglePopup(contentID, fieldID, "", "collapse");
        setTimeout(function() {
            const listener = new ISAACFieldListener(contentID, fieldID, targets, backend, "final");
            listener.handleEvent(answer.textContent);
        }, 250); // ms; 0.25 seconds
        thumbsUp.blur();
    };

    const thumbsDown = document.getElementById(`${contentID}_${fieldID}_no`);
    thumbsDown.classList.remove('h5p-isaac-hidden');
    thumbsDown.onclick = () => {
        togglePopup(contentID, fieldID, "", "collapse");
        setTimeout(function() {
            const listener = new ISAACFieldListener(contentID, fieldID, targets, backend, "final");
            listener.handleEvent(document.getElementById(`${contentID}_input_${fieldID}`).textContent);
        }, 250); // ms; 0.25 seconds
        thumbsDown.blur();
    };

    changeColor("orange", "input", document.getElementById(contentID + "_" + fieldID));
    resetPassageHighlights(contentID, -1);
    resetQuestionHighlights(contentID, fieldID);
    toggleCheckmark(contentID, fieldID, false);
    toggleFeedbackButton(contentID, fieldID, "hide");
    toggleInfoButton(contentID, fieldID, "hide");
    togglePopup(contentID, fieldID, "orange", "expand");
}

export function displayIncorrect(contentID, fieldID, feedback) {
    "use strict";
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup");
    popup.firstElementChild.innerText = feedback.feedbackString;

    const feedbackButton = document.getElementById(`${contentID}_${fieldID}_feedback_button`);
    feedbackButton.onclick = () => {
        toggleQAHighlight(contentID, fieldID, feedback);
        togglePopup(contentID, fieldID, "red", "toggle");
        feedbackButton.blur();
    };

    const passageHighlight = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
    if (passageHighlight !== null) {
        const infoButton = document.getElementById(`${contentID}_${fieldID}_info`);
        infoButton.onclick = () => {
            showPassageHighlight(contentID, fieldID); // TODO toggle instead?
            passageHighlight.scrollIntoView({
                behavior: 'smooth', // not supported by Safari and iOS
                block: 'center'
            });
            infoButton.blur();
        };
        toggleInfoButton(contentID, fieldID, "show");
    }

    changeColor("red", "input", document.getElementById(contentID + "_" + fieldID));
    toggleCheckmark(contentID, fieldID, false);
    toggleFeedbackButton(contentID, fieldID, "show");
}

export function displayCorrect(contentID, fieldID) {
    "use strict";
    changeColor("green", "input", document.getElementById(contentID + "_" + fieldID));
    resetPassageHighlights(contentID, fieldID);
    resetQuestionHighlights(contentID, fieldID);
    toggleCheckmark(contentID, fieldID, true);
    toggleFeedbackButton(contentID, fieldID, "hide");
    toggleInfoButton(contentID, fieldID, "hide");
    togglePopup(contentID, fieldID, "green", "collapse");
}

export function resetPassageHighlights(contentID, fieldID) {
    "use strict";
    // remove existing highlights (if present)
    if (fieldID > 0) {
        const passageHighlights = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
        if (passageHighlights !== null) { passageHighlights.classList.add("h5p-isaac-highlight-hidden"); }
    } else {
        // loop over all, because user may answer questions out of order
        for (let i = 0; i < document.getElementById(`${contentID}_questions`).childElementCount; i++) {
            const passageHighlights = document.getElementById(`${contentID}_mark_${i + 1}`);
            if (passageHighlights !== null) { passageHighlights.classList.add("h5p-isaac-highlight-hidden"); }
        }
    }
}

export function resetQuestionHighlights(contentID, fieldID) {
    "use strict";
    const questionHighlights = document.getElementById(`${contentID}_prompt_${fieldID + 1}`);
    if (questionHighlights !== null) {
        const highlightPattern = /<span id="\d+_\d+_prompt_highlight" class="h5p-isaac-highlight">|<\/span>/gi;
        questionHighlights.innerHTML = `${questionHighlights.innerHTML.replace(highlightPattern, '')}`;
    }
}

export function togglePopup(contentID, fieldID, color, action) {
    "use strict";
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup");
    changeColor(color, "popup", popup);
    if (action === "expand" || (action === "toggle" && popup.classList.contains('h5p-isaac-popup-collapsed'))) {
        popup.classList.remove('h5p-isaac-popup-collapsed');
        popup.classList.add('h5p-isaac-popup-expand');
        popup.firstElementChild.classList.remove('h5p-isaac-hidden');
    } else if (action === "collapse" || (action === "toggle" && popup.classList.contains('h5p-isaac-popup-expand'))) {
        popup.classList.add('h5p-isaac-popup-collapsed');
        popup.classList.remove('h5p-isaac-popup-expand');
        setTimeout(function() {
            popup.firstElementChild.classList.add('h5p-isaac-hidden');
            document.getElementById(`${contentID}_${fieldID}_yes`).classList.add('h5p-isaac-hidden');
            document.getElementById(`${contentID}_${fieldID}_no`).classList.add('h5p-isaac-hidden');
        }, 250); // ms; 0.25 seconds
    }
}

export function toggleQAHighlight(contentID, fieldID, feedback) {
    "use strict";
    const prompt = document.getElementById(`${contentID}_prompt_${fieldID + 1}`);
    const promptHighlight = document.getElementById(`${contentID}_${fieldID + 1}_prompt_highlight`);
    if (promptHighlight === null) {
        if (feedback.questionHighlightStart && feedback.questionHighlightEnd) {
            const start = prompt.innerText.substring(0, feedback.questionHighlightStart);
            const mark = prompt.innerText.substring(feedback.questionHighlightStart, feedback.questionHighlightEnd);
            const end = prompt.innerText.substring(feedback.questionHighlightEnd, prompt.innerText.length);
            const spanTag = `<span id= '${contentID}_${fieldID + 1}_prompt_highlight' class='h5p-isaac-highlight'>`;
            prompt.innerHTML = `${start}${spanTag}${mark}</span>${end}`;
            // TODO preserve existing HTML markup
        }
    } else {
        const highlightPattern = /<span id="\d+_\d+_prompt_highlight" class="h5p-isaac-highlight">|<\/span>/gi;
        prompt.innerHTML = `${prompt.innerHTML.replace(highlightPattern, '')}`;
    }

    const input = document.getElementById(`${contentID}_input_${fieldID}`);
    const inputHighlight = document.getElementById(`${contentID}_${fieldID}_input_highlight`);
    if (inputHighlight === null) {
        if (feedback.inputHighlightStart && feedback.inputHighlightEnd) {
            const start = input.innerText.substring(0, feedback.inputHighlightStart);
            const mark = input.innerText.substring(feedback.inputHighlightStart, feedback.inputHighlightEnd);
            const end = input.innerText.substring(feedback.inputHighlightEnd, input.innerText.length);
            const spanTag = `<span id='${contentID}_${fieldID}_input_highlight' class='h5p-isaac-highlight'>`;
            input.innerHTML = `${start}${spanTag}${mark}</span>${end}`;
            // TODO reset highlight when input returns to focus?
        }
    } else {
        const highlightPattern = /<span id="\d+_\d+_input_highlight" class="h5p-isaac-highlight">|<\/span>/gi;
        input.innerHTML = `${input.innerHTML.replace(highlightPattern, '')}`;
    }
}

export function showPassageHighlight(contentID, fieldID) {
    "use strict";
    const passageHighlight = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
    if (passageHighlight !== null) {
        // if (!passageHighlight.classList.contains('h5p-isaac-highlight-hidden')) {
        //     resetPassageHighlights(contentID, fieldID);
        // } else
        if (passageHighlight.classList.contains('h5p-isaac-highlight-hidden')) {
            passageHighlight.classList.remove('h5p-isaac-highlight-hidden');
        }
    }
}

export function toggleCheckmark(contentID, fieldID, showCheckmark) {
    "use strict";
    const userInputButton = document.getElementById(`${contentID}_${fieldID}_submit`);
    if (showCheckmark) {
        userInputButton.classList.remove('h5p-isaac-enter');
        userInputButton.classList.add('h5p-isaac-check');
        // enterButton.firstElementChild.classList.add('h5p-isaac-hidden'); // hide "Get Feedback" tooltip
    } else {
        userInputButton.classList.remove('h5p-isaac-check');
        userInputButton.classList.add('h5p-isaac-enter');
        // enterButton.firstElementChild.classList.remove('h5p-isaac-hidden'); // show "Get Feedback" tooltip
    }
}

export function toggleFeedbackButton(contentID, fieldID, action) {
    "use strict";
    const feedback = document.getElementById(`${contentID}_${fieldID}_feedback_button`);
    if (action === "show") {
        feedback.classList.add('h5p-isaac-button-show');
        feedback.classList.remove('h5p-isaac-hidden', 'h5p-isaac-button-hide');
    } else if (action === "hide") {
        feedback.classList.remove('h5p-isaac-button-show');
        feedback.classList.add('h5p-isaac-button-hide');
        setTimeout(function() {
            feedback.classList.add('h5p-isaac-hidden');
        }, 250); // ms; 0.25 seconds
    }
}

export function toggleInfoButton(contentID, fieldID, action) {
    "use strict";
    const info = document.getElementById(`${contentID}_${fieldID}_info`);
    if (action === "show") {
        // TODO only show if there are passage highlighting indices defined by content author
        info.classList.add('h5p-isaac-button-show');
        info.classList.remove('h5p-isaac-hidden', 'h5p-isaac-button-hide');
    } else if (action === "hide") {
        info.classList.remove('h5p-isaac-button-show');
        info.classList.add('h5p-isaac-button-hide');
        setTimeout(function () {
            info.classList.add('h5p-isaac-hidden');
        }, 250); // ms; 0.25 seconds
    }
}

/**
 *
 * @param color
 * @param type {"input", "popup"}
 * @param element
 */
function changeColor(color, type, element) {
    "use strict";
    switch (color) {
        case ("green"):
            element.classList.remove(`h5p-isaac-${type}-incorrect`, `h5p-isaac-${type}-suggestion`);
            element.classList.add(`h5p-isaac-${type}-correct`);
            break;
        case ("orange"):
            element.classList.remove(`h5p-isaac-${type}-correct`, `h5p-isaac-${type}-incorrect`);
            element.classList.add(`h5p-isaac-${type}-suggestion`);
            break;
        case ("red"):
            element.classList.remove(`h5p-isaac-${type}-correct`, `h5p-isaac-${type}-suggestion`);
            element.classList.add(`h5p-isaac-${type}-incorrect`);
            break;
    }
}
