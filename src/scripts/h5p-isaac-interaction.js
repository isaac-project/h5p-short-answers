import { resetHighlights, displayIncorrect, displayCorrect } from './h5p-isaac-content';

export class ISAACFeedbackRequest {
    constructor(host, taskID, fieldID, learnerAnswer) {
        this.host = host;
        this.taskID = taskID;
        this.fieldID = fieldID;
        this.learnerAnswer = learnerAnswer;
    }
}

export class ISAACFeedbackResponse {
    constructor(request, feedbackCode, feedbackString,
                questionHighlightStart, questionHighlightEnd,
                inputHighlightStart, inputHighlightEnd) {
        this.request = request;
        this.feedbackCode = feedbackCode;
        this.feedbackString = feedbackString;
        this.questionHighlightStart = questionHighlightStart;
        this.questionHhighlightEnd = questionHighlightEnd;
        this.inputHighlightStart = inputHighlightStart;
        this.inputHighlightEnd = inputHighlightEnd;
    }
}

export class ISAACFieldListener {
    constructor(taskID, fieldID, solutions, backend) {
        this.taskID = taskID;
        this.fieldID = fieldID;
        this.solutions = solutions;
        this.backend = backend;
    }

    handleEvent(e) {
        const feedbackReq = new ISAACFeedbackRequest(
            location.hostname,
            this.taskID,
            this.fieldID,
            e.currentTarget.value);

        fetch(this.backend + "feedback/get", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackReq),
        })
        .then((response) => response.json())
        .then((feedbackResp) => {

            // TODO compare existing correct/incorrect class with current
            // TODO and compare feedback response strings, for feedback/display update
            resetHighlights(this.taskID, this.solutions);

            if (feedbackResp.feedbackCode.localeCompare(1) === 0) {
                displayCorrect(this.taskID, this.fieldID);
            } else {
                displayIncorrect(this.taskID, this.fieldID, feedbackResp);
                // TODO behavior for incorrect answer when no feedback is available? (should there always be a pop-up?)
            }

        })
        .catch((error) => {
            console.error('Error:', error);
            // TODO display error
        });
    }
}

export class ISAACTask {
    constructor(baseUrl, contentID, title, library, jsonContent) {
        this.host = baseUrl;
        this.id = contentID;
        this.title = title;
        this.type = library;
        this.content = jsonContent;
    }
}

export function uploadTask(isaacTask, backend) {
    "use strict";
    fetch(backend + "tasks/" + isaacTask.host + "/" + isaacTask.id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(isaacTask),
    })
        .then((response) => {
            console.log('Success:', response);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
