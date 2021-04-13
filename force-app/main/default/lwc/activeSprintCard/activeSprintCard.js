import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ActiveSprintCard extends NavigationMixin(LightningElement) {
    @api stage;
    @api record;
    backlogId;
    sprintId;
    isBugType = false;
    createBug = false;
    disableProgressBar = false;
    value;
 
    get isSameStage() {
        return this.stage === this.record.stage__c;
    }
 
    renderedCallback() {
        this.backlogId = this.record.Id;
        this.value = this.record.Progress__c;
        if (this.record.Issue_Type__c === 'Bug' || !(this.stage == 'READY-TO-TEST' || this.stage == 'TEST-FAIL')) {
            this.isBugType = true;
        }
        if (this.record.Progress__c == 100) {
            this.disableProgressBar = true;
        } else {
            this.disableProgressBar = false;
        }
    }
 
    navigateBacklogHandler(event) {
        event.preventDefault()
        let issueId = event.target.dataset.id; 
        window.open("https://agile-ytracker-developer-edition.ap24.force.com/s/issue/"+ issueId);
    }
 
 
    

    itemDragStart() {
        const event = new CustomEvent('itemdrag', {
            detail: this.record.Id
        })
        this.dispatchEvent(event)
    }
 
    handleCreateBug() {
        this.createBug = true;
        const customEvent = new CustomEvent("createbug", { detail: this.createBug });
        this.dispatchEvent(customEvent);
    }
 
    handleSuccess(event) {
        console.log("in handle success " + event.detail.id);
        this.createBug = false;
        if (event.detail.id) {
            this.showToast("Success", "Bug Created", "success");
        } else {
            this.showToast("Error", "Error Creating Bug", "error");
        }
    }
 
    //
    progressOnChange(event) {
        let progressData = {};
        progressData.recordId = this.record.Id;
        progressData.progress = event.target.value;
        console.log('New progressData ' + progressData);
 
        const customEvent = new CustomEvent("updateprogress", { detail: progressData });
        this.dispatchEvent(customEvent);
    }
 
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
}