import { displayCorrect, displayIncorrect, displaySuggestion } from "./h5p-isaac-function";

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
        this.questionHighlightEnd = questionHighlightEnd;
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
        const feedbackReq = new ISAACFeedbackRequest(location.hostname, this.taskID, this.fieldID, e);

        fetch(this.backend + "feedback/get", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackReq),
        })
        .then((response) => response.json())
        .then((feedbackResp) => {

            if (feedbackResp.feedbackCode.localeCompare(1) === 0) {
                displayCorrect(this.taskID, this.fieldID);
            } else {
                displayIncorrect(this.taskID, this.fieldID, feedbackResp);
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

export class ISAACErrorCorrection { // TODO combine with ISAACFieldListener
    constructor(taskID, fieldID, solutions, backend) {
        this.taskID = taskID;
        this.fieldID = fieldID;
        this.solutions = solutions;
        this.backend = backend;
    }

    handleEvent(e) {

        // TODO calculate error correction
        // e = student answer

        // dummy
        const suggestion = { text: "Did you mean...?" }

        if (suggestion) {
            displaySuggestion(this.taskID, this.fieldID, suggestion);
        } else {
            const listener = new ISAACFieldListener(this.taskID, this.fieldID, this.solutions, this.backend);
            listener.handleEvent(e);
        }
    }
}
