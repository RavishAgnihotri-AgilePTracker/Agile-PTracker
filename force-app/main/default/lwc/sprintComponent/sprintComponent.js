import { LightningElement, wire, track, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import { registerListener, unregisterAllListeners, fireEvent } from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";
import getFilterBacklogList from '@salesforce/apex/IssueController.getFilterBacklogList';
import getBacklogList from '@salesforce/apex/IssueController.getBacklogList';
import getSprintList from '@salesforce/apex/SprintController.getSprintList';
import { NavigationMixin } from "lightning/navigation"
import userId from "@salesforce/user/Id";
import SPRINT_APPROVAL_REQUIRED from '@salesforce/schema/Project__c.Sprint_Approval_Required__c';

const fields = [SPRINT_APPROVAL_REQUIRED];

const completedSprintColumns = [{
        label: 'Sprint Name',
        sortable: "true",
        fieldName: 'urlpath',
        type: 'url',
        typeAttributes: { label: { fieldName: 'sprintName' }, value: { fieldName: 'sprintName' }, target: 'urlpath' }
    },
    { label: 'Stage', fieldName: 'stage' },
    { label: 'Start Date', fieldName: 'start_date' },
    { label: 'Target Date', fieldName: 'target_date' },
    { label: 'Total Backlogs', fieldName: 'totalBacklogs' },
    
];



export default class SprintComponent extends NavigationMixin(LightningElement) {

    @wire(CurrentPageReference) pageRef;
    @api recordId;
    @api projectId;
    @api isLead;
    @api isProductOwner;
    @track refreshresult;
    @track refreshSprintList;
    @track refreshBacklogList;
    @track completedSprintList;
    @track technicalBacklogList;
    @track businessBacklogList;
    @track totalTechnicalBacklogList;
    @track totalBusinessBacklogList;

    totalbacklogList;
    backlogList;
    totalCompletedSprintList;
    sprintList;
    filterBacklogList;
    sprintApprovalRequired;
    hasTechnicalBacklogs = false;
    hasBusinessBacklogs = false;
    hasCompletedSprints = false;
    hasSprints = false;
    createBacklog = false;
    sprintEdit = false;
    planBacklog = false;
    handleActiveSprintIsTrue = false;
    createSprint = false;
    isLoading = false;
    completedSprintColumns = completedSprintColumns;
    fields;
    activeSection;
    editSprint;
    backlogId;
    filterSprintId;
    message = 'Drag and drop backlog here or click on + button';
    hoverId;
    left;
    top;

    connectedCallback() {
        registerListener("refreshBacklogListInPlannedSprint", this.handleCallback, this);
    }

    handleCallback(detail) {
        return refreshApex(this.refreshBacklogList);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }


    updateTechnicalBacklogPaginationHandler(event) {
        this.technicalBacklogList = [...event.detail.records]
    }

    updateBusinessBacklogPaginationHandler(event) {
        this.businessBacklogList = [...event.detail.records];
        console.log('updateBusinessBacklogPaginationHandler ' + JSON.stringify(this.businessBacklogList));
        console.log('hasBusinessBacklogs ' + this.hasBusinessBacklogs)
    }

    handleToggleSection(event) {
        this.filterSprintId = event.detail.openSections;
    }
    refreshActiveSprint() {
        return refreshApex(this.refreshSprintList);
    }


    @wire(getRecord, { recordId: '$projectId', fields }) project({ error, data }) {
        this.isLoading = true;
        if (error) {
            this.isLoading = false;
            this.error = error;
            console.log('error - ' + error);
        } else if (data) {
            this.sprintApprovalRequired = data.fields.Sprint_Approval_Required__c.value;        
            this.isLoading = false;
        }
        
    }

    

    @wire(getSprintList, { projectId: "$projectId" }) getSprintList(result) {
        this.isLoading = true;
        this.refreshSprintList = result;
        let currentPlannedSprintData = [];
        let currentCompletedSprintData = [];
        let currentActiveSprintData = [];
        if (result.data) {
            result.data.forEach((row) => {
                let rowData = {};
                var urlpath = 'https://agile-ytracker-developer-edition.ap24.force.com/s/detail/';
                rowData.Id = row.Id;
                rowData.sprintName = row.Name;
                rowData.stage = row.Stage__c;
                rowData.start_date = row.Start_Date__c;
                rowData.target_date = row.Target_Date__c;
                rowData.urlpath = urlpath + row.Id;
                rowData.totalBacklogs =  row.Number_of_Completed_Backlogs__c;               
                if (row.Stage__c === 'COMPLETED') {
                    currentCompletedSprintData.push(rowData);
                } else if (row.Stage__c != 'COMPLETED' && row.isActive__c === false && (row.Sprint_Approval_Status__c === 'In-Plan' || row.Sprint_Approval_Status__c === 'Rejected')) {
                    currentPlannedSprintData.push(rowData);
                } else if (row.isActive__c === true || row.Sprint_Approval_Status__c === 'Pending') {
                    currentActiveSprintData.push(rowData);
                }


            });
            this.totalCompletedSprintList = currentCompletedSprintData;
            this.sprintList = currentPlannedSprintData;
            this.activeSection = this.sprintList[0];
            if (currentActiveSprintData.length === 0) {
                this.showActiveSprintButton = false;
            } else {
                this.showActiveSprintButton = true;
            }
            this.isLoading = false;
        }
        if (result.error) {
            this.error = result.error;
            this.isLoading = false;
        }
        if (currentCompletedSprintData.length) {
            this.hasCompletedSprints = true;
        } else {
            this.hasCompletedSprints = false;
        }
        if (currentPlannedSprintData.length) {
            this.hasSprints = true;
        } else {
            this.hasSprints = false;
        }

    }



    @wire(getFilterBacklogList, { filterSprintId: "$filterSprintId" }) getFilterBacklogs(result) {
        this.isLoading = true;
        let currentData = [];
        this.refreshresult = result;
        if (result.data) {
            result.data.forEach((row) => {
                let rowData = {};
                rowData.Id = row.Id;
                rowData.Title = row.Title__c;
                rowData.Priority = row.Priority__c
                currentData.push(rowData);
            });
            this.filterBacklogList = currentData;
            this.isLoading = false;
        }
        if (result.error) {
            this.error = result.error;
            this.isLoading = false;
        }
    }


    @wire(getBacklogList, { projectId: "$projectId" }) getBacklogs(result) {
        this.isLoading = true;
        let currentTechnicalData = [];
        let currentBusinessData = [];
        this.refreshBacklogList = result;
        if (result.data) {
            result.data.forEach((row) => {
                let rowData = {};
                rowData.Id = row.Id;
                rowData.Title = row.Title__c;
                rowData.Priority = row.Priority__c;
                if (row.Backlog__c === 'Technical') {
                    currentTechnicalData.push(rowData);
                } else if (row.Backlog__c === 'Business') {
                    currentBusinessData.push(rowData);
                }
            });
            this.isLoading = false;
        }
        if (currentTechnicalData.length) {
            this.totalTechnicalBacklogList = currentTechnicalData;
            this.hasTechnicalBacklogs = true;
        } else {
            this.hasTechnicalBacklogs = false;
        }
        if (currentBusinessData.length) {
            this.totalBusinessBacklogList = currentBusinessData;
            console.log('business backlog list ' + JSON.stringify(this.totalBusinessBacklogList));
            this.hasBusinessBacklogs = true;
            console.log('hasBusinessBacklogs ' + this.hasBusinessBacklogs)
        } else {
            this.hasBusinessBacklogs = false;
            console.log('hasBusinessBacklogs ' + this.hasBusinessBacklogs)
        }
        if (result.error) {
            this.error = result.error;
            this.isLoading = false;
        }
    }

    dropBacklogElement(event) {
        if (this.isProductOwner === true) {
            this.showToast('No Access', 'Sorry, You do not have Access to Move Backlogs', 'warning');
        } else {
            this.backlogId = event.dataTransfer.getData("backlog_id");
            this.updateFilterBacklog();
        }

    }

    updateFilterBacklog() {
        let record = {
            fields: {
                Id: this.backlogId,
                Sprint__c: null,
                Assigned_Employee__c: null,
                Estimated_Hours__c: 0
            },
        };

        updateRecord(record)
            .then(() => {
                this.refreshBacklogs();
                this.showToast("Success", "Backlog successfully remove from a Sprint", "success");
            })
            .catch(error => {
                this.showToast("Error adding Backlog to a Sprint", error.body.message, "error");
            });

    }

    dropElement(event) {
        if (this.isProductOwner === true) {
            this.showToast('No Access', 'Sorry, You do not have Access to Move Backlogs', 'warning');
        } else {
            this.backlogId = event.dataTransfer.getData("backlog_id");
            this.sprintId = event.target.dataset.item
            this.planBacklog = true;
        }
        this.refreshFilterBacklogs();
    }

    allowDrop(event) {
        event.preventDefault();
    }


    handleBacklogAddedToSprintSuccess() {
        this.refreshBacklogs();
        this.closeModal();
        this.showToast("Success", "Backlog successfully added to a Sprint", "success");
    }


    refreshBacklogs() {
        console.log("refreshBacklogs called");
        this.refreshFilterBacklogs();
        return refreshApex(this.refreshBacklogList);
    }

    refreshFilterBacklogs() {
        console.log("refreshFilterBacklogs called");
        return refreshApex(this.refreshresult);
    }



    handleDragStart(event) {
        event.dataTransfer.setData("backlog_id", event.target.dataset.item);
    }



    //To Enable sprint as Active Sprint 
    handleActiveSprint(event) {

        if (this.filterBacklogList.length === 0) {
            this.showToast("Warning", "Please add Backlogs to Sprint!", "warning");
        } else {
            this.recordId = event.target.dataset.item;
            console.log("recordId - " + this.recordId);
            this.handleActiveSprintIsTrue = true;
        }
    }

    //To hide and Show Active sprint option    


    closeModal() {
        this.handleActiveSprintIsTrue = false;
        this.createSprint = false;
        this.sprintEdit = false;
        this.planBacklog = false;
        this.createBacklog = false;
        return refreshApex(this.refreshSprintList);
    }

    //Update Sprint to mark it as active sprint
    handleUpdateSuccess(event) {
        this.showToast("Success", "Sprint Started!", "success");
        this.closeModal();
        fireEvent(this.pageRef, 'refreshActiveSprintSection', 'refresh')

    }


    handleCreateSprint() {
        this.createSprint = true;
    }

    currentUserId = userId;
    handleUpdateSubmit(event) {
        event.stopPropagation();
        event.preventDefault();
        const inputFields = event.detail.fields;
       
        // if (this.currentUserId == '0055g000003VR3HAAW') {
        //     // inputFields.Submit_for_Approval__c = true;
        //     // inputFields.Sprint_Approval_Status__c = 'Pending';

        // } else {
        //     inputFields.isActive__c = true;
        // }

        if (this.sprintApprovalRequired === true) {
             inputFields.Submit_for_Approval__c = true;
             inputFields.Sprint_Approval_Status__c = 'Pending';

        } else {
            inputFields.isActive__c = true;
            inputFields.Stage__c = 'IN-PROGRESS';
            inputFields.Sprint_Approval_Status__c = 'Approved';
        }

        this.template.querySelector("lightning-record-edit-form").submit(inputFields);

    }

    //Success when Sprint is created successfully
    handleSuccess() {
        this.showToast("Success", "Sprint Created Successfully", "success");
        this.closeModal();
        return refreshApex(this.refreshSprintList);
    }

    handleDeleteSprint(event) {
        let deleteSprint = event.target.dataset.item;
        deleteRecord(deleteSprint)
            .then(() => {
                this.showToast("Success", "Record Deleted", "success");
                return refreshApex(this.refreshSprintList);
            })
            .catch(error => {
                this.showToast("Error deleting record", error.body.message, "error");
            });
    }


    onClickHandleEditSprint(event) {
        this.editSprint = event.target.dataset.item;
        this.sprintEdit = true;
    }



    handleEditSprint(event) {
        event.stopPropagation();
        event.preventDefault();
        const inputFields = event.detail.fields;

        this.template.querySelector("lightning-record-edit-form").submit(inputFields);

        this.closeModal();
        return refreshApex(this.refreshresult);
    }

    createBacklogInsideSprint() {
        //console.log("enter in createBacklogInsideSprint")
        this.createBacklog = true;
    }


    submitCreateBacklog(event) {
        event.preventDefault();
        let fields = event.detail.fields;
        this.template.querySelector('lightning-record-edit-form').submit(fields);
        console.log('after submitting create backlog ' + JSON.stringify(fields));
    }

    handleCreateBacklogSuccess(event) {
        this.createBacklog = false;
        if (event.detail.id) {
            this.showToast("Success", "Backlog Created", "success");
        } else {
            this.showToast("Error", "Error Creating Backlog", "error");
        }
        return refreshApex(this.refreshresult);
    }

    // add completed sprint filtered for the pagination, to show on datatable
    handleCompletedSprintPagination(event) {
        this.completedSprintList = [...event.detail.records];
    }

    // a getter to set style for accordian
    get accordianStyle() {
        return `max-height:${15}rem; width:${46}rem`;
    }

    // a getter to assign top and left co-ordinate
    get boxClass() {
        return `background-color:white; top:${this.top}px; left:${this.left}px`;
    }
 
     // handler to show data when mouseover
     showHoverData(event) {
        this.top = 0;
        this.left = 0;
        this.hoverId = event.currentTarget.dataset.id;
        this.left = event.clientX - 780;
        this.top = event.clientY - 730;
    }

    // handler to show data when mouseout
    hideHoverData(event) {
        this.hoverId = "";
    }

    //Navigation using URL on selected Backlog
    handleAnchorClick(event) {
        let anchorBacklogId = event.currentTarget.dataset.id
        this[NavigationMixin.Navigate]({
            "type": "standard__webPage",
            "attributes": {
                "url": "https://agile-ytracker-developer-edition.ap24.force.com/s/issue/" + anchorBacklogId
            }
        });
    }

    handleBacklogAddedToSprintSubmit(event) {
        event.stopPropagation();
        event.preventDefault();
        const inputFields = event.detail.fields;
        if (this.currentUserId == '0055g000003VR3HAAW') {
            if (inputFields.Issue_Type__c === 'Story' && inputFields.Estimated_Hours__c <= '3') {
                this.showToast("Cannot add Story", "Story should be greater than 3 Hours, Change the Issue type to Task or increase the number of Hours ", "warning");
            } else if (inputFields.Issue_Type__c === 'Task' && inputFields.Estimated_Hours__c > '3') {
                this.showToast("Cannot add Task", "Task should be less than or equal to 3 Hours, Change the Issue type to Story or reduce the number of Hours ", "warning");
            } else {
                this.template.querySelector("lightning-record-edit-form").submit(inputFields);
            }
        }else{
            this.template.querySelector("lightning-record-edit-form").submit(inputFields);
        }
    }
    
    // method to show toast message
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