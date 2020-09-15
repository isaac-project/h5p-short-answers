export function displayIncorrect(contentID, fieldID, feedback) {
    "use strict";
    const input = document.getElementById(contentID + "_" + fieldID);
    input.classList.add("h5p-isaac-input-incorrect");
    input.classList.remove("h5p-isaac-input-correct");

    // populate feedback popup
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup").firstElementChild;
    popup.innerText = feedback.feedbackString;

    displayHighlight(contentID, fieldID, feedback);
    toggleCheckmark(contentID, fieldID, false);
    toggleFeedbackButton(contentID, fieldID, true);
    toggleInfoButton(contentID, fieldID, true);
}

export function displayCorrect(contentID, fieldID) {
    "use strict";
    const input = document.getElementById(contentID + "_" + fieldID);
    input.classList.add("h5p-isaac-input-correct");
    input.classList.remove("h5p-isaac-input-incorrect");

    toggleCheckmark(contentID, fieldID, true);
    toggleFeedbackButton(contentID, fieldID, false);
    toggleInfoButton(contentID, fieldID, false);
    togglePopup(contentID, fieldID, true);

    // remove question highlight
    resetQuestionHighlights(contentID, fieldID);
}

export function resetPassageHighlights(contentID, targets) {
    "use strict";
    // remove existing highlight (if present)
    for (let i = 0; i < targets.length; i++) {
        const passageHighlights = document.getElementById(`${contentID}_mark_${i + 1}`);
        if (passageHighlights !== null) { passageHighlights.classList.add("h5p-isaac-hidden"); }
    }
}

export function resetQuestionHighlights(contentID, fieldID) {
    "use strict";
    const questionHighlights = document.getElementById(`${contentID}_prompt_${fieldID + 1}`);
    if (questionHighlights !== null) {
        const highlightPattern = /<span class="h5p-isaac-highlight">|<\/span>/gi;
        questionHighlights.innerHTML = `${questionHighlights.innerHTML.replace(highlightPattern, '')}`;
    }
}

export function togglePopup(contentID, fieldID, isCorrect) {
    "use strict";
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup");
    if (popup.classList.contains('h5p-isaac-feedback-collapsed') && !isCorrect) {
        popup.classList.remove('h5p-isaac-feedback-collapsed', 'h5p-isaac-feedback-correct');
        popup.classList.add('h5p-isaac-feedback-incorrect', 'h5p-isaac-feedback-expand');
    } else if (popup.classList.contains('h5p-isaac-feedback-expand')) {
        if (isCorrect) {
            popup.classList.add('h5p-isaac-feedback-correct');
            popup.classList.remove('h5p-isaac-feedback-incorrect');
        }
        popup.classList.add('h5p-isaac-feedback-collapsed');
        popup.classList.remove('h5p-isaac-feedback-expand');
    }
}

function displayHighlight(contentID, fieldID, feedback) {
    "use strict";
    // highlight relevant text in passage
    const passageHighlight = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
    if (passageHighlight !== null) { passageHighlight.classList.remove("h5p-isaac-hidden"); }

    // highlight prompt
    if (feedback.questionHighlightStart && feedback.questionHighlightEnd) {
        const promptHighlight = document.getElementById(`${contentID}_prompt_${fieldID + 1}`);
        let start = promptHighlight.innerText.substring(0, feedback.questionHighlightStart);
        let mark = promptHighlight.innerText.substring(feedback.questionHighlightStart, feedback.questionHighlightEnd);
        let end = promptHighlight.innerText.substring(feedback.questionHighlightEnd, promptHighlight.innerText.length);
        promptHighlight.innerHTML = `${start}<span class='h5p-isaac-highlight'>${mark}</span>${end}`;
        // TODO preserve existing HTML markup
    }

    // highlight input
    if (feedback.inputHighlightStart && feedback.inputHighlightEnd) {
        const inputHighlight = document.getElementById(`${contentID}_input_${fieldID}`);
        let start = inputHighlight.innerText.substring(0, feedback.inputHighlightStart);
        let mark = inputHighlight.innerText.substring(feedback.inputHighlightStart, feedback.inputHighlightEnd);
        let end = inputHighlight.innerText.substring(feedback.inputHighlightEnd, inputHighlight.innerText.length);
        inputHighlight.innerHTML = `${start}<span class='h5p-isaac-highlight'>${mark}</span>${end}`;
        // TODO reset highlight when input returns to focus?
    }
}

export function toggleCheckmark(contentID, fieldID, showCheckmark) {
    "use strict";
    const userInputButton = document.getElementById(`${contentID}_${fieldID}_submit`);
    if (showCheckmark) {
        userInputButton.classList.remove('h5p-isaac-enter');
        userInputButton.classList.add('h5p-isaac-check');
        // enterButton.firstElementChild.classList.add('h5p-isaac-button-hidden'); // hide "Get Feedback" tooltip
    } else {
        userInputButton.classList.remove('h5p-isaac-check');
        userInputButton.classList.add('h5p-isaac-enter');
        // enterButton.firstElementChild.classList.remove('h5p-isaac-button-hidden'); // show "Get Feedback" tooltip
    }
}

export function toggleFeedbackButton(contentID, fieldID, showButton) {
    "use strict";
    const feedback = document.getElementById(`${contentID}_${fieldID}_feedback_button`);
    if (showButton) {
        feedback.classList.add('h5p-isaac-button-show');
        feedback.classList.remove('h5p-isaac-button-hidden', 'h5p-isaac-button-hide');
    } else {
        feedback.classList.remove('h5p-isaac-button-show');
        feedback.classList.add('h5p-isaac-button-hide');
        setTimeout(function() {
            // wait until animation finishes
            feedback.classList.add('h5p-isaac-button-hidden');
        }, 1500); // ms; 1.5 seconds
    }
}

export function toggleInfoButton(contentID, fieldID, showButton) {
    "use strict";
    const info = document.getElementById(`${contentID}_${fieldID}_info`);
    if (showButton) {
        // TODO only show if there are passage highlighting indices defined by content author
        info.classList.add('h5p-isaac-button-show');
        info.classList.remove('h5p-isaac-button-hidden', 'h5p-isaac-button-hide');
    } else {
        info.classList.remove('h5p-isaac-button-show');
        info.classList.add('h5p-isaac-button-hide');
        setTimeout(function () {
            // wait until animation finishes
            info.classList.add('h5p-isaac-button-hidden');
        }, 1500); // ms; 1.5 seconds
    }
}
