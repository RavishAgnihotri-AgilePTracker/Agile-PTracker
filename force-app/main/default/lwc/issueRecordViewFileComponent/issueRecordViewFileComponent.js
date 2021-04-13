
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

export default class IssueRecordViewFileComponent extends LightningElement {
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

}


