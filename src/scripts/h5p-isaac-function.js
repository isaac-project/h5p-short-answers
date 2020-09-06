export function displayIncorrect(contentID, fieldID, feedback,
                                 highlightStart, highlightEnd) { // TODO remove when feedback object is fixed
    "use strict";
    const input = document.getElementById(contentID + "_" + fieldID).firstElementChild;
    input.classList.add("h5p-isaac-input-incorrect");
    input.classList.remove("h5p-isaac-input-correct");

    displayPopup(contentID, fieldID, feedback);
    displayHighlight(contentID, fieldID, feedback, highlightStart, highlightEnd);
    displayInfoButton(contentID, fieldID);
}

export function displayCorrect(contentID, fieldID) {
    "use strict";
    const input = document.getElementById(contentID + "_" + fieldID).firstElementChild;
    input.classList.add("h5p-isaac-input-correct");
    input.classList.remove("h5p-isaac-input-incorrect");

    // hide info bubble
    const info = document.getElementById(`${contentID}_${fieldID}_info`);
    info.classList.remove('h5p-isaac-info-show');
    info.classList.add('h5p-isaac-info-hidden');

    // hide feedback pop-up
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup");
    popup.classList.remove('h5p-isaac-feedback-expand', 'h5p-isaac-feedback-incorrect');
    popup.classList.add('h5p-isaac-feedback-shrink', 'h5p-isaac-feedback-correct');

    // remove question highlight
    resetQuestionHighlights(contentID, fieldID);

    // disable input field when answer is correct
    // H5P.jQuery(input).attr('disabled', true);
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
    const questionHighlights = document.getElementById(`${contentID}_prompt_${fieldID + 1}`);
    if (questionHighlights !== null) {
        const highlightPattern = /<span class="h5p-isaac-highlight">|<\/span>/gi;
        questionHighlights.innerHTML = `${questionHighlights.innerHTML.replace(highlightPattern, '')}`;
    }
}

function displayPopup(contentID, fieldID, feedback) {
    "use strict";
    // retrieve and populate pop-up container
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup");
    popup.innerText = feedback.feedbackString;

    // create upper-right close button
    const x = document.createElement('span');
    x.setAttribute('class', 'h5p-isaac-feedback-close');
    x.innerHTML = '&times;';
    popup.appendChild(x);

    // close when user clicks x
    x.onclick = () => {
        popup.classList.add('h5p-isaac-feedback-shrink');
        popup.classList.remove('h5p-isaac-feedback-expand');
    };

    // display pop-up
    popup.classList.remove('h5p-isaac-feedback-shrink', 'h5p-isaac-feedback-correct');
    popup.classList.add('h5p-isaac-feedback-incorrect', 'h5p-isaac-feedback-expand');
}

function displayHighlight(contentID, fieldID, feedback, highlightStart, highlightEnd) {
    "use strict";
    // highlight relevant text in passage
    const passageHighlight = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
    if (passageHighlight !== null) { passageHighlight.classList.remove("h5p-isaac-hidden"); }

    // highlight prompt // TODO preserve existing HTML markup
    const promptHighlight = document.getElementById(`${contentID}_prompt_${fieldID + 1}`);
    let start = promptHighlight.innerText.substring(0, highlightStart);
    let mark = promptHighlight.innerText.substring(highlightStart, highlightEnd);
    let end = promptHighlight.innerText.substring(highlightEnd, promptHighlight.innerText.length);
    promptHighlight.innerHTML = `${start}<span class='h5p-isaac-highlight'>${mark}</span>${end}`;
}

function displayInfoButton(contentID, fieldID) {
    "use strict";
    // display info bubble // TODO only show if there is passage highlighting
    const info = document.getElementById(`${contentID}_${fieldID}_info`);
    info.classList.add('h5p-isaac-info-show');
    info.classList.remove('h5p-isaac-info-hidden');
}
