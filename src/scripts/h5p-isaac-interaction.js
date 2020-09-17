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
    constructor(taskID, fieldID, solutions, backend, action) {
        this.taskID = taskID;
        this.fieldID = fieldID;
        this.solutions = solutions;
        this.backend = backend;
        this.action = action;
    }

    handleEvent(e) {

        const suggestion = {};

        if (this.action === "intermediate") {

            // TODO calculate error correction
            suggestion.text = "42";

        }

        if (suggestion.text) {

            displaySuggestion(this.taskID, this.fieldID, this.solutions, this.backend, suggestion);

        } else if (!suggestion.text || (this.action === "final")) {

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
