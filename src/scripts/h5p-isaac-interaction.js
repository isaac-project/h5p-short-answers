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
        this.content = JSON.parse(jsonContent);
    }
}
