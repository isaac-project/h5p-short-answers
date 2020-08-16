import { highlightIncorrect, populateAndShowPopup, displayCorrect } from './h5p-isaac-content';

const BACKEND = "http://localhost:9090/isaac-webapp/";

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
        highlightStart, highlightEnd) {
            this.request = request;
            this.feedbackCode = feedbackCode;
            this.feedbackString = feedbackString;
            this.highlightStart = highlightStart;
            this.highlightEnd = highlightEnd;
        }
}

export class ISAACFieldListener {
    constructor(taskID, fieldID, solutions) {
        this.taskID = taskID;
        this.fieldID = fieldID;
        this.solutions = solutions;
    }

    handleEvent(e) {
        const feedbackReq = new ISAACFeedbackRequest(
            location.hostname,
            this.taskID,
            this.fieldID,
            e.currentTarget.value);
        console.log(feedbackReq);
        
        fetch(BACKEND + "feedback/get", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackReq),
        })
        .then((response) => response.json())
        .then((feedbackResp) => {
            console.log(feedbackResp.feedbackCode);

            // behavior for correct answer
            for (let i = 0; i < this.solutions.length; i++) {
                if (feedbackReq.learnerAnswer.trim() === this.solutions[i].trim()) {
                    displayCorrect(this.taskID, this.fieldID);
                    return;
                }
            }

            // temp, delete when feedback/indices are being returned properly
            feedbackResp.highlightStart = 0;
            feedbackResp.highlightEnd = 10;

            // highlight incorrect input fields and relevant passage text TODO: verify indices are within span of text?
            highlightIncorrect(this.taskID, this.fieldID, feedbackResp);

            // display feedback for incorrect answer
            populateAndShowPopup(this.taskID, this.fieldID, feedbackResp);

            // TODO behavior for incorrect answer when no feedback is available? (should there always be a pop-up?)

        })
        .catch((error) => {
            console.error('Error:', error);
            // TODO display error
        });
    }
}

export class ISAACTask {
    constructor(baseUrl, contentId, title, library, jsonContent) {
        this.host = baseUrl;
        this.id = contentId;
        this.title = title;
        this.type = library;
        this.content = jsonContent;
    }
}

export function uploadTask(isaacTask) {
    "use strict";    
    fetch(BACKEND + "tasks/" + isaacTask.host + "/" + isaacTask.id, {
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
