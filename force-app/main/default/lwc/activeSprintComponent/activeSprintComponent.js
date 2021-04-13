import { api, LightningElement, track, wire } from 'lwc';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { NavigationMixin, CurrentPageReference } from 'lightning/navigation';
import BACKLOG_OBJECT from '@salesforce/schema/Issue__c';
import ID_FIELD from '@salesforce/schema/Issue__c.Id';
import STAGE_FIELD from '@salesforce/schema/Issue__c.stage__c';
import PROGRESS_FIELD from '@salesforce/schema/Issue__c.Progress__c';
import SPRINT_ID_FIELD from '@salesforce/schema/Sprint__c.Id';
import SPRINT_STAGE_FIELD from '@salesforce/schema/Sprint__c.Stage__c';
import ACTIVE_FIELD from '@salesforce/schema/Sprint__c.isActive__c';
import getAllSprints from '@salesforce/apex/SprintController.getSprintsInProject';
import getBacklogs from '@salesforce/apex/IssueController.getBacklogsForActiveSprint';
import userId from "@salesforce/user/Id";





export default class ActiveSprintComponent extends NavigationMixin(LightningElement) {

    @api projectName;
    @api projectId;
    @api lead;
    @api isLead;
    @api isProductOwner;
    @track records;
    @track refreshTable;
    @track inactiveSprintData;
    @track incompleteBacklogs = [];
    @wire(CurrentPageReference) pageRef;
    showIncompleteBacklogModal = false;
    activeSprints = false;
    hasRecords = false;
    addCommentModal = false;
    createBug;
    pickVals;
    recordId;
    recordRelatedtoBugId;
    selectedSprintInComboboxId;
    isActive;
    sprintId;
    sprintName;
    message;
    incompleteBaklogsListLength;
    currentUserId;
    avgSprintProgressValue;
    SprintLastModefiedDate;
    sprintCurrentProgress;
    selectedSprintInComboboxId  = '';


    connectedCallback() {
        this.currentUserId = userId;
        registerListener("refreshActiveSprintSection", this.handleCallback, this);
    }

    handleCallback() {
        return refreshApex(this.refreshTable);
    }

    disconnectedCallback() {
            unregisterAllListeners(this);
        }
        /** Fetch metadata abaout the issue object**/
    @wire(getObjectInfo, { objectApiName: BACKLOG_OBJECT })
    objectInfo
    /*** fetching Stage Picklist ***/

    @wire(getPicklistValues, {
        recordTypeId: '$objectInfo.data.defaultRecordTypeId',
        fieldApiName: STAGE_FIELD
    }) stagePicklistValues({ data, error }) {
        if (data) {
            //console.log("Stage Picklist", data)
            this.pickVals = data.values.map(item => item.value)
        }
        if (error) {
            console.error(error)
        }
    }


    /****getter to calculate the  width dynamically*/
    get calcWidth() {
        let len = this.pickVals.length;
        console.log("length====>" + len);
        return 'width: calc(100vw/ ${len})';
    }

    // wired call to get the list of all sprints for the project and seperate the active sprint
    @wire(getAllSprints, { projectId: '$projectId' }) getSprintList(result) {
        this.isLoading = true;
        this.refreshTable = result;
        let newArray = [];
        let activeSprintArray = [];
        let object = {};
        object.label = 'None';
        object.value = 'none';
        newArray.push(object);

        let object1 = {};
        object1.label = 'Create New';
        object1.value = 'createNew';
        newArray.push(object1);

        if (result.data) {
            result.data.forEach(element => {
                if (element.isActive__c == true) {
                    console.log('in if');
                    this.sprintId = element.Id;
                    this.sprintName = element.Name;
                    this.sprintCurrentProgress = element.Cumulative_Progress__c;
                    this.SprintLastModefiedDate = element.LastModifiedDate.substring(0, 10);
                    activeSprintArray.push(element);
                } else {
                    let object = {};
                    object.label = element.Name;
                    object.value = element.Id;
                    newArray.push(object);
                }
            });
            this.isLoading = false;
        }
        if (activeSprintArray.length) {
            this.activeSprints = true;
            this.isLoading = false;
        } else {
            this.activeSprints = false;
            this.isLoading = false;
        }
        this.getBacklogList(this.sprintId);
        this.inactiveSprintData = newArray;
        console.log('Inactive sprint data ' + JSON.stringify(this.inactiveSprintData));
    }

    // method to get backlogs for Active Sprint
    getBacklogList(sprintId) {
        this.incompleteBacklogs = [];
        let sprintProgressValue;
        let backlogRecordCount;
        var currDate = new Date().toISOString().slice(0, 10);
        //console.log('curr date ' + currDate)
        getBacklogs({ sprintId: sprintId })
            .then(data => {
                this.records = data;
                if (this.records.length) {
                    sprintProgressValue = 0;
                    this.avgSprintProgressValue = 0;
                    backlogRecordCount = 0;
                    this.records.forEach(element => {
                        if (element.stage__c !== 'COMPLETED') {
                            this.incompleteBacklogs.push(element);
                        }
                        sprintProgressValue = sprintProgressValue + element.Progress__c;
                        backlogRecordCount++;
                    });
                    this.avgSprintProgressValue = (sprintProgressValue / backlogRecordCount).toFixed(2);

                    if (currDate != this.SprintLastModefiedDate) {
                        this.updatePreviousDaySprintProgress(sprintId, this.sprintCurrentProgress);
                    } else {
                        this.updateSprintProgress(sprintId, this.avgSprintProgressValue);
                    }
                    this.template.querySelector(".slds-progress-bar").style = "margin-top:1rem;width:" + this.avgSprintProgressValue + "%;";
                    if (this.avgSprintProgressValue < 50) {
                        this.template.querySelector(".Progress").style = "color:red;";
                    } else if (this.avgSprintProgressValue > 50 && this.avgSprintProgressValue < 75) {
                        this.template.querySelector(".Progress").style = "color:orange;";
                    } else if (this.avgSprintProgressValue > 75) {
                        this.template.querySelector(".Progress").style = "color:forestgreen;";
                    }
                } else {
                    //this.hasRecords = false;
                }
                this.isLoading = false;
            })
            .catch(error => {
                console.log('Error in get backlog list ' + JSON.stringify(error.message));
                this.isLoading = false;
            })
    }

    // handler for drag event
    handleListItemDrag(event) {
        this.recordId = event.detail;
        console.log('handleListItemDrag ' + JSON.stringify(event.detail));
    }

    // handler for ondrop event
    handleItemDrop(event) {
        let stage = event.detail;
        let currentRecord;

        if (this.isProductOwner === true) {
            this.showToast('No Access', 'Sorry, You do not have Access to Move Backlogs', 'warning');
        } else {
            this.records.forEach(element => {
                if (element.Id === this.recordId) {
                    currentRecord = element;
                }
            });
            //console.log('handleItemDrop ' + JSON.stringify(event.detail));
            console.log('currentRecord ' + JSON.stringify(currentRecord));
            if (currentRecord.stage__c !== stage) {
                if (stage === 'COMPLETED' && currentRecord.Have_Test_Script__c == true) {
                    this.addCommentModal = true;
                    // } 
                    // if (stage === 'COMPLETED') {
                    //     this.addCommentModal = true;
                } else if (currentRecord.Progress__c < 50 && stage === 'READY-TO-TEST') {
                    this.showToast('Cannot Change Stage', 'Progress must be 50% of higher to move in READY-TO-TEST stage', 'warning');
                }
                else if ((stage === 'TEST-PASS' || stage === 'TEST-FAIL' || stage === 'COMPLETED') && currentRecord.Have_Test_Script__c != true) {
                    this.showToast('Cannot Change Stage', 'You must add Test Script file before moving to Next Stage', 'warning');
                } 
                else {
                    this.addCommentModal = false;
                    // needs to be commented so that progress go one-way i.e. from TO-D to COMPLETED
                    this.updateHandler(stage, currentRecord);
                }
            } else {
                this.showToast('No Change', 'Stage did not Changed', 'Info')
            }
        }
    }

    // close the comment modal that comes when a backlog is moved to COMPLETED stage
    closeCommentModal() {
        this.addCommentModal = false;
    }

    //  backlog update onsuccess handler
    handleSuccess(event) {
        this.addCommentModal = false;
        this.showToast('Success', 'Updated Successfully', 'success');
        this.getBacklogList(this.sprintId);
    }

    // update handler to update the progress and stage of the backlog if dragged and dropped
    updateHandler(stage, currRecord) {
        console.log('current record in update handler ' + JSON.stringify(currRecord));
        const fields = {};
        let progress = 0;
        if (currRecord.Progress__c == 0 && stage !== "TO-DO") {
            progress = 10;
        } else {
            progress = currRecord.Progress__c;
        }
        if (stage === 'TO-DO') {
            progress = 0;
        }

        if (currRecord.stage__c !== stage) {
            fields[ID_FIELD.fieldApiName] = this.recordId;
            fields[STAGE_FIELD.fieldApiName] = stage;
            fields[PROGRESS_FIELD.fieldApiName] = progress;
            const recordInput = { fields };
            updateRecord(recordInput)
                .then(() => {
                    console.log("Updated Successfully");
                    this.showToast('Success', 'Updated Successfully', 'success');
                    this.getBacklogList(this.sprintId);
                }).catch(error => {
                    console.error(error)
                });
        } else {
            this.showToast('', 'Stage did not Changed', 'Info')
        }
    }

    //options for combobox with inactive sprints
    get options() {
        return this.inactiveSprintData;
    }

    // handler to register selected sprint in combobox
    handleChange(event) {
        this.selectedSprintInComboboxId = event.detail.value;
        if (event.detail.value == 'createNew') {
            this.createSprint = true;
        } else {
            this.createSprint = false;
        }
    }


    // method to calculate number of incompleted backlogs in the sprint if the 'Complete Sprint' button has been clicked
    handleCompleteSprint() {
        this.incompleteBaklogsListLength = this.incompleteBacklogs.length;
        //console.log('length incomplete backlogs ' + this.incompleteBaklogsListLength);

        if (this.incompleteBaklogsListLength) {
            this.message = ' backlog(s) is/are incomplete';
            this.showIncompleteBacklogModal = true;
        } else {
            this.completeSprint(this.sprintId);
        }
    }

    // onclick handler for Sprint Completion (Complete button for Sprint completion modal)
    onClickCompleteSprint() {
        const recordInputs = this.incompleteBacklogs.map(value => {
            const obj = {};
            obj.Id = value.Id;
            obj.Sprint__c = this.selectedSprintInComboboxId;
            obj.Comment__c = '';
            obj.stage__c = 'TO-DO';
            obj.Progress__c = 0;

            const fields = Object.assign({}, obj);
            return { fields };
        });
        this.selectedSprintInComboboxId = '';
        console.log('recordInputs on complete ' + JSON.stringify(recordInputs));

        const promises = recordInputs.map(recordInput => updateRecord(recordInput));
        Promise.all(promises).then(response => {
            // console.log('response on complete ' + JSON.stringify(response));
            this.incompleteBacklogs = [];
            this.showToast('Success', 'Backlogs Moved', 'success');
            this.showIncompleteBacklogModal = false;
            this.getBacklogList(this.sprintId);
        }).catch(error => {
            console.log('response on complete ' + JSON.stringify(error));
            this.showToast('Error', 'Error Moving Backlogs', 'error');
        });
        this.completeSprint();
    }

    // close incomplete backlog modal
    closeIncompleteBacklogModal() {
        this.showIncompleteBacklogModal = false;
    }

    // complete sprint handler to update sprint status to 'COMPLETED'
    completeSprint() {
        const fields = {};
        fields[SPRINT_ID_FIELD.fieldApiName] = this.sprintId;
        fields[SPRINT_STAGE_FIELD.fieldApiName] = 'COMPLETED';
        fields[ACTIVE_FIELD.fieldApiName] = false;
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(response => {
                //console.log('response on sprint complete ' + response);
                this.showToast('Success', 'Sprint Completed', 'success');
                fireEvent(this.pageRef, 'refreshBacklogList', 'refreshBacklogComponent');
                return refreshApex(this.refreshTable);
            })
            .catch(error => {
                console.log('Error on sprint complete ' + JSON.stringify(error));
                this.showToast('Error', 'Error Completing Sprint', 'error');
            });
    }



    // progress update handler
    handleProgressUpdate(event) {
        let stage;
        let currentRecord;
        let progress = event.detail.progress;
        this.recordId = event.detail.recordId;

        this.records.forEach(element => {
            if (element.Id === this.recordId) {
                currentRecord = element;
            }
        });

        if (progress == 0) {
            stage = 'TO-DO';
            this.updateProgressOfIssue(this.recordId, progress, stage);
        } else if (progress > 0 && progress <= 49) {
            stage = 'IN-PROGRESS';
            this.updateProgressOfIssue(this.recordId, progress, stage);
        } else if (progress > 49 && progress <= 99) {
            if (currentRecord.stage__c === 'IN-PROGRESS') {
                stage = 'READY-TO-TEST';
            } else {
                stage = currentRecord.stage__c;
            }
            //console.log('stage ' + stage + ' progress ' + progress);
            this.updateProgressOfIssue(this.recordId, progress, stage);
        } else if (progress == 100) {
            stage = 'COMPLETED';
            this.addCommentModal = true;
        }
        else if (progress == 100 && currentRecord.Have_Test_Script__c == true) {
            stage = 'COMPLETED';
            this.addCommentModal = true;
        } else {
            this.showToast('Cannot Change Stage', 'You must add Test Script file before moving to Next Stage', 'warning');
        }
    }


    // update the progress and stage via slider
    updateProgressOfIssue(recordId, progress, stage) {
        const fields = {};
        //console.log('updateProgressOfIssue: stage ' + stage + ' progress ' + progress);
        fields[ID_FIELD.fieldApiName] = recordId;
        fields[STAGE_FIELD.fieldApiName] = stage;
        fields[PROGRESS_FIELD.fieldApiName] = progress;
        const recordInput = { fields };
        updateRecord(recordInput)
            .then(() => {
                //console.log("Updated Successfully");
                this.showToast('Success', 'Updated Successfully', 'success');
                this.getBacklogList(this.sprintId);
            }).catch(error => {
                console.error(error)
            });
    }


    // handle bug creation
    handleCreateBug(event) {
        this.recordRelatedtoBugId = event.detail;
        this.createBug = true;
    }

    // bug success create handler
    handleBugCreateSuccess() {
        this.createBug = false;
        this.showToast('Success', 'Created Successfully', 'success');
        this.getBacklogList(this.sprintId);
    }

    // close Bug Modal
    closeBugModal() {
        this.createBug = false;
    }

    // update previous sprint progress 
    updatePreviousDaySprintProgress(sprintId, currentSprintProgress) {
        let record = {
            fields: {
                Id: sprintId,
                PreviousDayCumulativeProgress__c: currentSprintProgress
            },
        };
        updateRecord(record)
    }

    // update current sprint progress
    updateSprintProgress(sprintId, sprintProgress) {
        let record = {
            fields: {
                Id: sprintId,
                Cumulative_Progress__c: sprintProgress
            },
        };
        updateRecord(record)
    }

    //Navigation using URL on selected Sprint
    handleAnchorClick() {
        this[NavigationMixin.Navigate]({
            "type": "standard__webPage",
            "attributes": {
                "url": "https://agile-ytracker-developer-edition.ap24.force.com/s/sprint/" + this.sprintId
            }
        });
    }

    // Generic Toast Event method
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        )
    }

    createSprint = false;
    handleCreateSprint() {
        this.createSprint = true;
    }

    closeSprintModal() {
        this.createSprint = false;
    }

    submitCreateSprint(event) {
        event.preventDefault();
        let fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        //console.log('after submitting create backlog ' + JSON.stringify(fields));
    }

    handleCreateSprintSuccess(event) {
        this.createSprint = false;
        if (event.detail.id) {
            this.showToast("Success", "Sprint Created", "success");
        } else {
            this.showToast("Error", "Error Creating Backlog", "error");
        }
        return refreshApex(this.refreshTable);
    }

}