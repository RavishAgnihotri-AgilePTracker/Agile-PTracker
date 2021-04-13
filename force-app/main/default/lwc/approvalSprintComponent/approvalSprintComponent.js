import { LightningElement, api, track, wire } from 'lwc';
import getBacklogsForActiveSprint from '@salesforce/apex/IssueController.getBacklogsForActiveSprint';
import getPendingApprovalSprintList from '@salesforce/apex/SprintController.getPendingApprovalSprintList';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation"
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';


const columns = [{
        label: 'Backlog Title',
        sortable: "true",
        fieldName: 'urlpath',
        type: 'url',
        typeAttributes: { label: { fieldName: 'Title' }, value: { fieldName: 'Title' }, target: 'urlpath' }
    },
    { label: 'Type', fieldName: 'Type', sortable: "true" },
    { label: 'Stage', fieldName: 'stage', sortable: "true" },
    { label: 'Assigned Employee', fieldName: 'AssigneeEmployee', sortable: "true" },
    { label: 'Estimated Hours', fieldName: 'Estimated_Hours', sortable: "true" }
];

export default class ApprovalSprintComponent extends NavigationMixin(LightningElement) {

    sprintId;
    @api projectId;
    @api isLead;
    @api isProductOwner;
    @track columns = columns;
    @track pendingApprovalBacklogList;
    @wire(CurrentPageReference) pageRef;
    totalPendingApprovalBacklogList;
    askReason = false;
    hasBacklogs = false
    hasData = false
    
    ALL_RecordsForFilter = [];
    
    
    connectedCallback() {
        this.pendingApprovalSprintList();
        registerListener("refreshActiveSprintSection", this.handleCallback, this);
    }

    handleCallback() {
        this.pendingApprovalSprintList();
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    sprintName;
    startDate;
    targetDate;
    
    pendingApprovalSprintList() {
        console.log("method called");
        getPendingApprovalSprintList({ projectId: this.projectId })
            .then(data => {
                console.log("data in  pendingApprovalSprintList- " + JSON.stringify(data))
                if (data.length) {
                    this.sprintId = data[0].Id;
                    this.sprintName = data[0].Name;
                    this.startDate = data[0].Start_Date__c;
                    this.targetDate = data[0].Target_Date__c;
                    this.hasData = true;
                    this.getBacklogsOfPendingApprovalSpint(this.sprintId);
                }else{
                    this.hasData = false;
                }
                
            }).catch(error => {
                console.log("error in  pendingApprovalSprintList- " + JSON.stringify(error))
            })           
    }


    getBacklogsOfPendingApprovalSpint(sprintId) {
        let currentData = [];
        getBacklogsForActiveSprint({ sprintId: sprintId })
            .then(response => {
                response.forEach((row) => {
                    var urlpath = 'https://agile-ytracker-developer-edition.ap24.force.com/s/detail/';
                    let rowData = {};
                    rowData.Id = row.Id;
                    rowData.Title = row.Title__c;
                    rowData.stage = row.stage__c;
                    rowData.Type = row.Issue_Type__c;
                    rowData.AssigneeEmployee = row.Assigned_Employee__r.Name;
                    rowData.Estimated_Hours = row.Estimated_Hours__c;
                    rowData.urlpath = urlpath + row.Id;
                    currentData.push(rowData);
                });
                this.totalPendingApprovalBacklogList = currentData;
                this.ALL_RecordsForFilter = currentData;
                if (this.totalPendingApprovalBacklogList.length) {
                    this.hasBacklogs = true;
                } else {
                    this.hasBacklogs = false;
                }
            }).catch(error => {
                console.log("error in getBacklogsOfPendingApprovalSpint - " + JSON.stringify(error))
            })
    }

    // add sprint filtered for the pagination, to show on datatable
    handleSprintPagination(event) {
        this.pendingApprovalBacklogList = [...event.detail.records];
    }

    // handler to update the status of Sprint_Approval_Status__c to Approved and activate the Sprint 
    onclickApprove() {
        console.log("enter in approve")
        let record = {
            fields: {
                Id: this.sprintId,
                isActive__c: true,
                Sprint_Approval_Status__c: 'Approved',
                Stage__c:'IN-PROGRESS'
            },
        };
        //console.log('on click approve ' + record);
        updateRecord(record)
            .then(() => {
                this.showToast("Success", "Sprint Approved", "success");
                this.pendingApprovalSprintList();
            })
            .catch(error => {
                console.log('error ' + JSON.stringify(error));
                this.showToast("Error Approving Sprint", error.body.message, "error");
            });
    }

    onclickReject() {
        this.askReason = true;
    }

    // onsubmit handler to add Sprint_Approval_Status__c field before submit
    handleSubmit(event) {
        event.stopPropagation();
        event.preventDefault();
        const inputFields = event.detail.fields;
        inputFields.Sprint_Approval_Status__c = 'Rejected';
        this.template.querySelector("lightning-record-edit-form").submit(inputFields);
    }

    // success handler for the Reason for Rejection of Sprint's Approval
    handleSuccess() {
        this.askReason = false;
        this.showToast("Rejected", "Sprint Rejected", "warning");
        this.pendingApprovalSprintList();
    }

    // close the modal for Reason for Rejection of Sprint's Approval
    closeReasonModal() {
        this.askReason = false;
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

    handleSortdata(event) {
        // field name
        this.sortBy = event.detail.fieldName;

        // sort direction
        this.sortDirection = event.detail.sortDirection;

        // calling sortdata function to sort the data based on direction and selected field
        this.sortData(event.detail.fieldName, event.detail.sortDirection);
    }

    sortData(fieldname, direction) {
        // serialize the data before calling sort function
        let parseData = JSON.parse(JSON.stringify(this.pendingApprovalBacklogList));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1: -1;

        // sorting data 
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });

        // set the sorted data to data table data
        this.pendingApprovalBacklogList = parseData;

    }

     /////////////////////////Get Picklist Value of Issue Type & Priority  //////////////////////////////
     get optionsIssueType() {
        return [
          { label: "All", value: "All" },
          { label: "Story", value: "Story" },
          { label: "Task", value: "Task" },
          { label: "Bug", value: "Bug" }
        ];
      }
 
     get optionsStageType() {
        return [
          { label: "All", value: "All" },
          { label: "TO-DO", value: "TO-DO" },
          { label: "IN-PROGRESS", value: "IN-PROGRESS" },
          { label: "READY-TO-TEST", value: "READY-TO-TEST" },
          { label: "TEST-PASS", value: "TEST-PASS" },
          { label: "TEST-FAIL", value: "TEST-FAIL" },
          { label: "COMPLETED", value: "COMPLETED" }
        ];
      }
 
    handleChangeIssueType(event) {
 
        let inputValue = event.detail.value;
        const regex = new RegExp(`^${inputValue}`, "i");
        if (inputValue !== 'All') {
            this.pendingApprovalBacklogList = this.ALL_RecordsForFilter.filter(row => regex.test(row.Type));
        } else {
            this.pendingApprovalBacklogList = this.ALL_RecordsForFilter;
        }
        (this.pendingApprovalBacklogList.length) ? (this.hasBacklogs = true) : (this.hasBacklogs = false);
    }
 
    handleChangeStage(event) {
    
        let inputValue = event.detail.value;
        const regex = new RegExp(`^${inputValue}`, "i");
        if (inputValue !== 'All') {
            this.pendingApprovalBacklogList = this.ALL_RecordsForFilter.filter(row => regex.test(row.stage));
        } else {
            this.pendingApprovalBacklogList = this.ALL_RecordsForFilter;
        }
        (this.pendingApprovalBacklogList.length) ? (this.hasBacklogs = true) : (this.hasBacklogs = false);
    }

}