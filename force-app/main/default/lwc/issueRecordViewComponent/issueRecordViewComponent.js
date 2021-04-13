import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import BACKLOG_TYPE_FIELD from '@salesforce/schema/Issue__c.Backlog__c';
import LEAD from '@salesforce/schema/Issue__c.Assignee__c';
import PROJECT_ID from '@salesforce/schema/Issue__c.Project__c';
import getRelatedTechnicalBacklogList from '@salesforce/apex/IssueController.getRelatedTechnicalBacklogList';
import saveFile from '@salesforce/apex/FileController.saveFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';



const fields = [BACKLOG_TYPE_FIELD, PROJECT_ID, LEAD];

const columns = [
    {
        label: "Title",
        sortable: "true",
        fieldName: 'urlpath',
        type: 'url',
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        },
        typeAttributes: { label: { fieldName: 'Title' }, value: { fieldName: 'Title' }, target: 'urlpath' }
    },
    {
        label: "Issue Type",
        sortable: "true",
        fieldName: "issueType",
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        }
    },
    {
        label: "Priority",
        sortable: "true",
        fieldName: "priority",
        cellAttributes: { class: { fieldName: "statusCSSClass" } }
    },
    {
        label: "Estimated Hours",
        fieldName: "estimatedHours",
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        }
    },
    {
        label: "Assignee",
        fieldName: "assignee",
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        }
    },
    {
        type: "button-icon",
        initialWidth: "50",
        typeAttributes: {
            iconName: "utility:edit",
            name: "edit"
        },
        cellAttributes: {
            alignment: "right",
            iconName: {
                fieldName: "icon_0",
                iconPosition: "right"
            }
        }
    },
    {
        type: "button-icon",
        initialWidth: "50",
        typeAttributes: {
            iconName: "utility:delete",
            name: "delete",
            iconClass: "slds-icon-text-error"
        },
        cellAttributes: {
            alignment: "right",
            iconName: {
                fieldName: "icon_1",
                iconPosition: "right"
            }
        }
    }]

export default class IssueRecordViewComponent extends LightningElement {
    @api recordId;
    type;
    projectId;
    lead;
    isBusinessBacklog = false;
    hasTechnicalBacklog = false;
    backlogList;
    columns = columns;
    createBacklog = false;
    editBacklog = false;
    isLoading = false;
    refreshTechnicalBacklogList;
    rowId;
    totalBacklogList;

    @wire(getRecord, { recordId: '$recordId', fields }) issue({ error, data }) {
        this.isLoading = true;
        if (error) {
            this.isLoading = false;
            this.error = error;
            console.log('error - ' + error);
        } else if (data) {
            this.type = data.fields.Backlog__c.value;
            this.projectId = data.fields.Project__c.value;
            this.lead = data.fields.Assignee__c.value;
            this.isLoading = false;
        }
        if (this.type === 'Business') {
            this.isBusinessBacklog = true;
        }
    }

    @wire(getRelatedTechnicalBacklogList, { productBacklogId: '$recordId', searchKey: '$searchKey' }) getTechnicalBacklogs(result) {
        this.isLoading = true;
        this.refreshTechnicalBacklogList = result;
        let backlogArray = [];
        if (result.data) {
            var urlpath = 'https://agile-ytracker-developer-edition.ap24.force.com/s/detail/';
            result.data.forEach((element) => {
                let backlog = {};
                backlog.Id = element.Id;
                backlog.Title = element.Title__c;
                backlog.issueType = element.Issue_Type__c;
                backlog.priority = element.Priority__c;
                backlog.estimatedHours = element.Estimated_Hours__c;
                backlog.urlpath = urlpath + element.Id;
                if (element.Assigned_Employee__c) {
                    backlog.assignee = element.Assigned_Employee__r.Name;
                }
                if (backlog.priority === 'Low') {
                    backlog.statusCSSClass = 'slds-text-color_success slds-theme_shade slds-text-title_bold';
                } else if (backlog.priority === 'High') {
                    backlog.statusCSSClass = 'slds-text-color_error slds-theme_shade slds-text-title_bold';
                }else{
                    backlog.statusCSSClass = 'slds-theme_shade slds-text-title_bold';
                }
                backlogArray.push(backlog);
            });
           this.ALL_RecordsForFilter = backlogArray;
            this.totalBacklogList = backlogArray;
            if (backlogArray.length) {
                this.hasTechnicalBacklog = true;
            }
            this.isLoading = false;
        } else if (result.error) {
            this.isLoading = false;
            this.totalBacklogList = [];
        }
    }

    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            let filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
            this.file = filesUploaded[0];
            if (this.file.size > this.MAX_FILE_SIZE) {
                this.showToast('Could Not Upload File', 'File size should be less than 150 Kb', 'warning');
                return;
            }
        }
    }

    uploadHelper() {
        // create a FileReader object 
        this.fileReader = new FileReader();
        // set onload function of FileReader object  
        this.fileReader.onloadend = (() => {
            this.fileContents = this.fileReader.result;
            let base64 = 'base64,';
            this.content = this.fileContents.indexOf(base64) + base64.length;
            this.fileContents = this.fileContents.substring(this.content);

            // call the uploadProcess method 
            this.saveToFile();
        });

        this.fileReader.readAsDataURL(this.file);
    }

    // Calling apex class to insert the file
    saveToFile() {
        saveFile({ idParent: this.fileUploadId, strFileName: this.file.name, base64Data: encodeURIComponent(this.fileContents) })
            .then(result => {
                console.log('uploaded file ' + JSON.stringify(result));
            })
            .catch(error => {

            });
    }

    // method to show modal for creating backlogs
    onClickCreate() {
        this.createBacklog = true;
        this.fileName = '';
    }

    // close modal that shows create backlog pop-up
    closeModal() {
        this.createBacklog = false;
        this.fileName = '';
        this.editBacklog = false;
    }

    saveClick() {
        this.template.querySelector('lightning-record-edit-form').submit(this.fields);
        if (this.isSaveAndNew == true) {
            this.handleReset();
        } else {
            this.createBacklog = false;
        }
    }

    saveAndNewClick() {
        this.isSaveAndNew = true;
        this.saveClick();
    }

    // reset handler to reset the selected fields value
    handleReset() {
        this.fileName = '';
        this.createBacklog = true;
        this.isSaveAndNew = false;
        const inputFields = this.template.querySelectorAll('.resetField');
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }

    // handler that runs after successfull creation of backlog
    handleSuccess(event) {
        this.fileUploadId = event.detail.id;
        this.showToast("Success", "Backlog Created", "success");

        if (this.fileUploadId && this.fileName != '') {
            //this.uploadFile = true;
            this.uploadHelper();
        }
        return refreshApex(this.refreshTechnicalBacklogList);
    }

    // row-action handler for edit and delete actions of datatable
    handleRowAction(event) {
        let actionName = event.detail.action.name;
        this.rowId = event.detail.row.Id;
        switch (actionName) {
            case "edit":
                this.editBacklog = true;
                break;

            case "delete":
                this.delete(this.rowId);
                break;

            default:
        }
    }

    //method to delete the selected record
    delete(rowId) {
        deleteRecord(rowId)
            .then((data) => {
                this.showToast("Success", "Backlog Deleted", "success");

                return refreshApex(this.refreshTechnicalBacklogList);
            })
            .catch((error) => {
                this.showToast("Error", error.message.body, "error");
            });
    }

    // add backlog filtered for the pagination
    handleListPagination(event) {
        this.backlogList = [...event.detail.records];
    }

    // handler that runs after successfull updation of backlog
    handleEditSuccess(event) {
        this.editBacklog = false;
        if (event.detail.id) {
            this.showToast("Success", "Backlog Updated", "success");
        } else {
            this.showToast("Error", "Error Updating Backlog", "error");
        }
        return refreshApex(this.refreshTechnicalBacklogList);
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
        let isReverse = direction === 'asc' ? 1 : -1;

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
    
    //-----------------------------filter----------------------------------------------------------------

    get optionsIssueType() {
        return [
            { label: "All", value: "All" },
            { label: "Story", value: "Story" },
            { label: "Task", value: "Task" },
            { label: "Bug", value: "Bug" }
        ];
    }

    get optionsPriorityType() {
        return [
            { label: "All", value: "All" },
            { label: "High", value: "High" },
            { label: "Medium", value: "Medium" },
            { label: "Low", value: "Low" }
        ];
    }

    get optionsBacklogType() {
        return [
            { label: "All", value: "All" },
            { label: "Technical", value: "Technical" },
            { label: "Business", value: "Business" }
        ];
    }

    handleChangeBacklogType(event) {

        let inputValue = event.detail.value;
        console.log();
        const regex = new RegExp(`^${inputValue}`, "i");
        if (inputValue !== 'All') {
            this.totalBacklogList = this.ALL_RecordsForFilter.filter(row => regex.test(row.backlogType));
        } else {
            this.totalBacklogList = this.ALL_RecordsForFilter;
        }
        (this.totalBacklogList.length) ? (this.backlogContent = true) : (this.backlogContent = false);
    }


    handleChangeIssueType(event) {

        let inputValue = event.detail.value;
        console.log();
        const regex = new RegExp(`^${inputValue}`, "i");
        if (inputValue !== 'All') {
            this.totalBacklogList = this.ALL_RecordsForFilter.filter(row => regex.test(row.issueType));
        } else {
            this.totalBacklogList = this.ALL_RecordsForFilter;
        }
        (this.totalBacklogList.length) ? (this.backlogContent = true) : (this.backlogContent = false);
    }


    handleChangePriority(event) {
        let inputValue = event.detail.value;
        const regex = new RegExp(`^${inputValue}`, "i");
        if (inputValue !== 'All') {
            this.totalBacklogList = this.ALL_RecordsForFilter.filter(row => regex.test(row.priority));
        } else {
            this.totalBacklogList = this.ALL_RecordsForFilter;
        }
        (this.totalBacklogList.length) ? (this.backlogContent = true) : (this.backlogContent = false);
    }


    // Toast Notification method, show Toast depending upon given title, message and variant
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }

    @api searchKey = '';

    handleKeyChange( event ) {
        this.searchKey = event.target.value;
        return refreshApex(this.totalBacklogList);
    }

}


