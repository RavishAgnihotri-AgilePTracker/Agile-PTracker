import { LightningElement, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getContentDistributionForFile from '@salesforce/apex/FileController.getContentDistributionForFile';

const columns = [{
        label: 'File Name',
        fieldName: 'Title',
        wrapText: true,
    },
    { label: 'File Type', fieldName: 'Type' },
    {
        label: 'Download',
        type: 'button-icon',
        initialWidth: '50',
        typeAttributes: {
            iconName: 'action:download',
            name: 'save',
            variant : "brand"
        }
    },
    {
        label: 'Delete',
        type: 'button-icon',
        initialWidth: '50',
        typeAttributes: {
            iconName: 'utility:delete',
            name: 'delete',
            iconClass: 'slds-icon-text-error'
        }
    }
    
];

export default class FilesList extends NavigationMixin(LightningElement) {

    @api files;
    @track originalMessage;
    @track isDialogVisible = false;
    columns = columns;

    //------------------------------Row Action------------------------------------

    handleRowActions(event) {
        let actionName = event.detail.action.name;
        let rowId = event.detail.row.Id;

        switch (actionName) {
            case 'save':
                this.handleDownloadFile(rowId);
                break;
            case 'delete':
                this.handleDelete(rowId);
                break;
        }
    }

    
    //------------------------------FIle-Delete-----------------------------------

    handleDelete(rowId) {
        deleteRecord(rowId)
            .then(() => {
                this.showToast("Success", "File deleted", "success");
                this.dispatchEvent(new CustomEvent('filedelete', {}));
            })
            .catch(error => {
                this.showToast("Error deleting file", error, "error");
            });

    }


    //------------------------------FIle-Download-----------------------------------

    handleDownloadFile(rowId) {
        getContentDistributionForFile({
                contentDocumentId: rowId
            })
            .then(response => {
                // console.log(JSON.stringify(response));
                window.open(response.ContentDownloadUrl);
            })
            .catch(error => {
                //console.log(JSON.stringify(error));
            })
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

}