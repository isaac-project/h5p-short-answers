export class ISAACFieldListener {
    constructor(taskID, fieldID) {
        this.taskID = taskID;
        this.fieldID = fieldID;
    }

    handleEvent(e) {
        console.log("Answer typed: " + e.currentTarget.value);
        console.log("Listener: " + JSON.stringify(this));
        console.log("User: " + H5PIntegration.user.name);
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
    "use strict";
    const hostName = "http://localhost:9090/isaac-webapp/tasks/";

    fetch(hostName + isaacTask.id, {
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
