const BACKEND = "http://localhost:9090/isaac-webapp/";

export class ISAACFeedbackRequest {
    constructor(taskID, fieldID, learnerID, learnerAnswer) {
        this.taskID = taskID;
        this.fieldID = fieldID;
        this.learnerID = learnerID;
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
    constructor(taskID, fieldID) {
        this.taskID = taskID;
        this.fieldID = fieldID;
    }

    handleEvent(e) {
        const feedbackReq = new ISAACFeedbackRequest(
            this.taskID,
            this.fieldID,
            H5PIntegration.user.name,
            e.currentTarget.value);

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
            // TODO display feedback
        })
        .catch((error) => {
            console.error('Error:', error);
            // TODO display error
        });
    }
}

export class ISAACTask {
    constructor(baseUrl, contentId, title, library, jsonContent) {
        this.server = baseUrl;
        this.id = contentId;
        this.title = title;
        this.type = library;
        this.content = jsonContent;
    }
}

export function uploadTask(isaacTask) {
    
    fetch(BACKEND + "tasks/" + isaacTask.id, {
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
