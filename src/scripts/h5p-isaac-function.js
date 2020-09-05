export function displayIncorrect(contentID, fieldID, feedback) {
    "use strict";
    const input = document.getElementById(contentID + "_" + fieldID).firstElementChild;
    input.classList.add("h5p-isaac-input-incorrect");
    input.classList.remove("h5p-isaac-input-correct");

    // highlight relevant text in passage
    const highlight = document.getElementById(`${contentID}_mark_${fieldID + 1}`);
    if (highlight !== null) {
        highlight.classList.remove("h5p-isaac-hidden");
    }

    // display info bubble
    const info = document.getElementById(`${contentID}_${fieldID}_info`);
    info.classList.add('h5p-isaac-info-show');
    info.classList.remove('h5p-isaac-info-hidden');

    // retrieve pop-up container
    const popup = document.getElementById(contentID + "_" + fieldID + "_popup");
    popup.innerText = feedback.feedbackString;

    // upper-right close button
    const x = document.createElement('span');
    x.setAttribute('class', 'h5p-isaac-feedback-close');
    x.innerHTML = '&times;';
    popup.appendChild(x);

    // close when user clicks x
    x.onclick = () => {
        popup.classList.add('h5p-isaac-feedback-shrink');
        popup.classList.remove('h5p-isaac-feedback-expand');
    }

    // display pop-up
    popup.classList.remove('h5p-isaac-feedback-shrink', 'h5p-isaac-feedback-correct');
    popup.classList.add('h5p-isaac-feedback-incorrect', 'h5p-isaac-feedback-expand');
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

    // disable input field when answer is correct
    // H5P.jQuery(input).attr('disabled', true);
}

export function resetPassageHighlights(contentID, targets) {
    "use strict";
    // remove existing highlight (if present)
    for (let i = 0; i < targets.length; i++) {
        const passageHighlights = document.getElementById(`${contentID}_mark_${i + 1}`);
        if (passageHighlights !== null) {
            passageHighlights.classList.add("h5p-isaac-hidden");
        }
    }
}
