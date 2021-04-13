import { LightningElement, api, track } from 'lwc';
import getBacklogsForActiveSprint from '@salesforce/apex/IssueController.getBacklogsForActiveSprint';

const columns = [{
    label: 'Backlog Title',
    sortable: "true",
    fieldName: 'urlpath',
    type: 'url',
    cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    },
    typeAttributes: { label: { fieldName: 'Title' }, value: { fieldName: 'Title' }, target: 'urlpath' }
},
    { label: 'Type', fieldName: 'Type', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Stage', fieldName: 'stage', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Assigned Employee', fieldName: 'AssigneeEmployee', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Estimated Hours', fieldName: 'Estimated_Hours', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } }
];

export default class SprintRecordViewDetailComponent extends LightningElement {

    @api recordId;
    @track columns = columns;
    @track backlogList;
    hasBacklogs = false;
    isLoading = false;
    sortBy;
    sortDirection;
    ALL_RecordsForFilter = [];
    
    
    connectedCallback() {
        this.getBacklogsOfSpint(this.recordId);
    }

    getBacklogsOfSpint(sprintId) {
        this.isLoading = true;
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
                this.totalBacklogList = currentData;
                this.ALL_RecordsForFilter = currentData;
                if (this.totalBacklogList.length) {
                    this.hasBacklogs = true;
                } else {
                    this.hasBacklogs = false;
                }
                this.isLoading = false;
            }).catch(error => {
                this.isLoading = false;
                error = result.error;
                console.log(error)
            });
    }

    // add sprint filtered for the pagination, to show on datatable
    handleSprintPagination(event) {
        this.backlogList = [...event.detail.records];
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
        let parseData = JSON.parse(JSON.stringify(this.backlogList));

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
        this.backlogList = parseData;

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
            this.totalBacklogList = this.ALL_RecordsForFilter.filter(row => regex.test(row.Type));
        } else {
            this.totalBacklogList = this.ALL_RecordsForFilter;
        }
        (this.totalBacklogList.length) ? (this.hasBacklogs = true) : (this.hasBacklogs = false);
    }
 
    handleChangeStage(event) {
    
        let inputValue = event.detail.value;
        const regex = new RegExp(`^${inputValue}`, "i");
        if (inputValue !== 'All') {
            this.totalBacklogList = this.ALL_RecordsForFilter.filter(row => regex.test(row.stage));
        } else {
            this.totalBacklogList = this.ALL_RecordsForFilter;
        }
        (this.totalBacklogList.length) ? (this.hasBacklogs = true) : (this.hasBacklogs = false);
    }
}