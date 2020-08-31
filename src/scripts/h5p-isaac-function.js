export function displayIncorrect(contentID, fieldID, feedback) {
    "use strict";
    // underline incorrect input fields
    const wrapper = document.getElementById(contentID + "_" + fieldID);
    const input = wrapper.firstElementChild;
    input.classList.remove("h5p-isaac-correct");    // answer has been changed; remove correct label
    wrapper.classList.remove("h5p-input-correct");
    input.classList.add("h5p-isaac-incorrect");           // highlight with red underline
    wrapper.classList.add("h5p-input-incorrect");

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
    popup.innerText = feedback.feedbackString;

    // upper-right close button
    const x = document.createElement('span');
    x.setAttribute('class', 'modal-close');
    x.innerHTML = '&times;';
    popup.appendChild(x);

    // display pop-up
    popup.classList.remove('modal-fadeout');
    popup.classList.add('modal-fadein');

    // document.addEventListener("keydown", function (e) {
    //   if (e.key === "Escape")
    //     popup.style.display = "none";
    // });

    // close when user clicks x
    x.onclick = () => {
        popup.classList.add('modal-fadeout');
        setTimeout(()=> {
            popup.classList.remove('modal-fadeout')
            popup.classList.remove('modal-fadein');
        },1250); // milliseconds = 1.25 second
    }
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
        popup.classList.remove('modal-fadeout');
        popup.classList.remove('modal-fadein');
    },1250); // milliseconds = 1.25 second

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
