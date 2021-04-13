import { api, LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import backlogs from '@salesforce/apex/IssueController.getBacklogs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import saveFile from '@salesforce/apex/FileController.saveFile';



const columns = [{
    label: "Title",
    wrapText: 'true',
    sortable: "true",
    fieldName: 'urlpath',
    type: 'url',
    wrapText: true,
    initialWidth: 250,
    typeAttributes: { label: { fieldName: 'Title' }, value: { fieldName: 'Title' }, target: 'urlpath' },
    cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    }
},
{
    label: "Backlog Type",
    wrapText: 'true',
    sortable: "true",
    fieldName: "backlogType",
   
    cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    }
},
{
    label: "Issue Type",
    wrapText: 'true',
    sortable: "true",
    fieldName: "issueType",
    
    cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    }
},
{
    label: "Priority",
    wrapText: 'true',
    sortable: "true",
    fieldName: "priority",
    
    cellAttributes: { class: { fieldName: "statusCSSClass" } }
},
{
    label: "Estimated Hours",
    wrapText: 'true',
    sortable: "true",
    fieldName: "estimatedHours",
    initialWidth: 100,
    cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    }
},
{
    label: "Assignee",
    wrapText: 'true',
    initialWidth: 150,
    sortable: "true",
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
}
];

export default class BacklogComponent extends LightningElement {

    @api projectId;
    @api lead;
    //@api type;
    @api isLead;
    @api isProductOwner;
    @wire(CurrentPageReference) pageRef;
    @track refreshTable;
    @track backlogList;
    @track totalBacklogList;
    @track sortBy;
    @track sortDirection;
    recordId;
    fileUploadId;
    fields;
    fileName = '';
    filesUploaded = [];
    file;
    fileContents;
    fileReader;
    content;
    MAX_FILE_SIZE = 1500000;
    backlogContent;
    isSaveAndNew = false;
    createBacklog = false;
    editBacklog = false;
    activeSpinner = true;
    showNew = false;
    hideField = false;
    isLoading = false;
    value;
    ALL_RecordsForFilter = [];
    isEpic = false;

    columns = columns;

    connectedCallback() {
        registerListener("refreshList", this.handleCallback, this);

    }

    handleCallback(detail) {
        return refreshApex(this.refreshTable);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }



    // get the backlog list
    @wire(backlogs, { projectId: "$projectId", searchKey: '$searchKey' }) getBacklogList(result) {
        this.isLoading = true;
        this.refreshTable = result;
        let backlogArray = [];
        if (result.data) {
            var urlpath = 'https://agile-ytracker-developer-edition.ap24.force.com/s/detail/';
            result.data.forEach((element) => {
                let backlog = {};
                backlog.Id = element.Id;
                backlog.Title = element.Title__c;
                backlog.backlogType = element.Backlog__c;
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
            // this.backlogList = backlogArray;
            if (backlogArray.length) {
                this.activeSpinner = false;
                this.backlogContent = true;
                this.totalBacklogList = backlogArray;
            } else {
                this.activeSpinner = false;
                this.backlogContent = false;
            }
            this.isLoading = false;
        } else if (result.error) {
            this.isLoading = true;
            this.backlogContent = false;
            this.backlogList = [];
        }

    }

    // method to show modal for creating backlogs
    onClickCreate() {
        this.createBacklog = true;
        this.fileName = '';
    }

    // handler that runs after successfull creation of backlog
    handleSuccess(event) {
        console.log('in handle success')
        this.fileUploadId = event.detail.id;
        this.showToast("Success", "Backlog Created", "success");
        fireEvent(this.pageRef, 'refreshBacklogListInPlannedSprint', 'refreshBacklogList');
        if (this.fileUploadId && this.fileName != '') {
            //this.uploadFile = true;
            this.uploadHelper();
        }
        return refreshApex(this.refreshTable);
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

    // close modal that shows create backlog pop-up
    closeModal() {
        this.createBacklog = false;
        this.fileName = '';
    }

    // handler that runs after successfull updation of backlog
    handleEditSuccess(event) {
        this.editBacklog = false;
        if (event.detail.id) {
            this.showToast("Success", "Backlog Updated", "success");
        } else {
            this.showToast("Error", "Error Updating Backlog", "error");
        }
        return refreshApex(this.refreshTable);
    }

    // close modal that shows edit backlog pop-up
    closeEditModal() {
        this.editBacklog = false;
    }


    // row-action handler for edit and delete actions of datatable
    handleRowAction(event) {
        let actionName = event.detail.action.name;
        let row = event.detail.row;
        this.recordId = event.detail.row.Id;

        switch (actionName) {
            case "edit":
                this.permissionCheck(row, actionName);
                break;

            case "delete":
                this.permissionCheck(row, actionName);
                break;

            default:
        }
    }

    // check if the current user using edit/delete action is Lead
    permissionCheck(row, actionName) {
        if (row.backlogType == 'Business' && this.isLead == true && actionName === 'delete') {
            this.showToast('No Access', 'Sorry! You cannot Delete Business Backlogs', 'warning');
        } else if (row.backlogType == 'Business' && this.isLead == true && actionName === 'edit') {
            this.showToast('No Access', 'Sorry! You cannot Edit Business Backlogs', 'warning');
        } else {
            if (actionName === 'edit') {
                this.editBacklog = true;
            } else if (actionName === 'delete') {
                this.delete(row.Id);
            }
        }
    }

    //method to delete the selected record
    delete(backlogId) {
        deleteRecord(backlogId)
            .then((data) => {
                this.showToast("Success", "Backlog Deleted", "success");
                fireEvent(this.pageRef, 'refreshBacklogListInPlannedSprint', 'refreshBacklogList');
                return refreshApex(this.refreshTable);
            })
            .catch((error) => {
                this.showToast("Error", error.message.body, "error");
            });
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



    // add backlog filtered for the pagination
    handleListPagination(event) {
        this.backlogList = [...event.detail.records];
        this.backlogContent = true;
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


    //onchange handler to know type and show releated business lookup
    onTypeSelection(event) {
        const typeValue = event.target.value;
        //console.log('type value ' + typeValue);

        if (typeValue === 'Business') {
            this.hideField = true;
        } else if (typeValue === 'Technical') {
            this.hideField = false;
        }
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

    //-----------------------------filter----------------------------------------------------------------

    get optionsBacklogType() {
        return [
            { label: "All", value: "All" },
            { label: "Business", value: "Business" },
            { label: "Technical", value: "Technical" }
        ];
    }

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

    @api searchKey = '';

    handleKeyChange( event ) {
        this.searchKey = event.target.value;
        return refreshApex(this.totalBacklogList);
    }

    // issueChangeHandler(event) {
    //     const issueValue = event.target.value;
    //     //console.log('Issue value ' + issueValue);
    //     if (issueValue === "Epic") {
    //         this.isEpic = true;
    //     } else {
    //         this.isEpic = false;
    //     }
    // }

    drag(event){
        //event.dataTransfer.setData("divId", event.detail.row.Id);
        event.dataTransfer.setData("divId", event.row.Id);
        console.log('data - '+event.data)
    }

    allowDrop(event){
        event.preventDefault();
    }

    drop(event){
        event.preventDefault();
        let divId = event.dataTransfer.getData("divId");
        console.log('DragId - '+divId);
    }

}