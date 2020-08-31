export function displayIncorrect(contentID, fieldID, feedback) {
    "use strict";
    // underline incorrect input fields
    const wrapper = document.getElementById(contentID + "_" + fieldID);
    wrapper.classList.remove("h5p-input-correct");
    wrapper.classList.add("h5p-input-incorrect");
    const input = wrapper.firstElementChild;
    input.classList.remove("h5p-isaac-correct"); // answer has been changed; remove correct label
    input.classList.add("h5p-isaac-incorrect"); // highlight with red underline
    // input.addEventListener('focus', () => input.classList.remove("h5p-isaac-incorrect"), false);

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
    const popup = document.getElementById(contentID + "_" + fieldID + "_modal");

    // text content
    popup.innerHTML = '';
    const modal_content = document.createElement('p');
    modal_content.setAttribute('class', 'modal-content');
    modal_content.innerText = feedback.feedbackString;

    // upper-right close button
    const x = document.createElement('span');
    x.setAttribute('class', 'close');
    x.innerHTML = '&times;';
    modal_content.appendChild(x);

    // display pop-up
    popup.appendChild(modal_content);
    popup.style.display = "block";

    // document.addEventListener("keydown", function (e) {
    //   if (e.key === "Escape")
    //     popup.style.display = "none";
    // });

    // close when user clicks x
    x.onclick = () => popup.style.display = "none";
}

export function displayCorrect(contentID, fieldID) {
    "use strict";
    const wrapper = document.getElementById(contentID + "_" + fieldID);
    wrapper.classList.remove("h5p-input-incorrect");
    wrapper.classList.add("h5p-input-correct");
    const input = wrapper.firstElementChild;
    input.classList.remove("h5p-isaac-incorrect"); // remove red underline (if present)
    input.classList.add("h5p-isaac-correct"); // highlight with green underline

    // hide info bubble
    const info = document.getElementById(`${contentID}_${fieldID}_info`);
    info.classList.remove('h5p-isaac-info-show');
    info.classList.add('h5p-isaac-info-hidden');

    // hide feedback popup
    const popup = document.getElementById(contentID + "_" + fieldID + "_modal");
    popup.classList.add('modal-fadeout');
    setTimeout(()=>{
        popup.style.display = "none";
        popup.classList.remove('modal-fadeout');
    },250); // milliseconds = 0.25 second

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
