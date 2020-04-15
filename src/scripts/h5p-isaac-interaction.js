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