import { LightningElement, track, api, wire } from 'lwc';
import saveFile from '@salesforce/apex/FileController.saveFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getRelatedFiles from '@salesforce/apex/FileController.getRelatedFiles';
import { fireEvent } from 'c/pubsub';
import getObjectName from '@salesforce/apex/ProjectController.getObjectName';

import { updateRecord } from 'lightning/uiRecordApi';


export default class CustomFileUploader extends LightningElement {
    @api recordId;
    @api disableUpload;
    @track refreshFiles;
    @track fileList;
    fileName = '';
    UploadFile = 'Upload File';
    isTrue = false;
    selectedRecords;
    filesUploaded = [];
    file;
    fileContents;
    fileReader;
    content;
    MAX_FILE_SIZE = 150000;

    hasFiles = false;

    objName;

    get acceptedFormats() {
        return ['.pdf', '.png', '.docx', '.pptx', '.xlsx', '.jpg', '.ppt', '.xls', '.doc', '.csv', '.txt'];
    }

    connectedCallback(){
        this.getObject();
    }

    getObject(){
        getObjectName({myRecordId:this.recordId}).then(data=>{
            this.objName = data;
        }).catch(error=>{
            console.log('error - '+error);
        })
    }

    //Get all related files - Releated to Issue
    @wire(getRelatedFiles, { recordId: '$recordId' }) getFilesList(result) {
        this.refreshFiles = result;
        let fileArray = [];
        if (result.data) {
            this.fileList = result.data;
            fileArray = this.fileList;
            if (fileArray.length) {
                this.hasFiles = true;                
            } else {
                this.hasFiles = false;
            }
        } else if (result.error) {
            console.log('Error ' + JSON.stringify(result.error));
        }
        fireEvent(this.pageRef, 'refreshBacklogListInPlannedSprint', 'refreshBacklogList');
    };

    //Refresh File when file get deleted or uploaded
    handleActionFinished(event) {      
        return refreshApex(this.refreshFiles);
    }


    // getting file deltails that is uploaded
    handleFilesChange(event) {
        if (event.target.files.length > 0) {
            this.filesUploaded = event.target.files;
            this.fileName = event.target.files[0].name;
        }
    }

    //Save File
    handleSave() {
        if (this.filesUploaded.length > 0) {
            this.uploadHelper();
        } else {
            this.fileName = 'Please select file to upload!!';
        }
    }

  //Uploading files on the Salesforce Org
    uploadHelper() {
        this.file = this.filesUploaded[0];
        let temp = this.file.name.split('.');
        if (this.file.size > this.MAX_FILE_SIZE) {
            const evt = new ShowToastEvent({
                title: "Please upload the file with size less than 150KB",
                variant: "error"
            });
            this.dispatchEvent(evt);
        }
        
        
       


        console.log('file name - '+this.file.name);
        this.fileReader = new FileReader();
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
        saveFile({ idParent: this.recordId, strFileName: this.file.name, base64Data: encodeURIComponent(this.fileContents) })
            .then(result => {
                this.fileName = this.fileName + ' - Uploaded Successfully';
                this.isTrue = true;
                this.handleActionFinished();
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success!!',
                        message: this.file.name + ' - Uploaded Successfully!!!',
                        variant: 'success',
                    }),
                );
                if(this.objName === 'Issue__c'){
                    this.checkTestScript();
                }               
            })
    }

    checkTestScript(){
        let temp = this.fileName.split('.');
        if(temp[0].includes('_test') && ( temp[1].includes('txt') || temp[1].includes('doc') )){
            let record = {
                fields: {
                    Id: this.recordId,
                    Have_Test_Script__c: true,                
                },
            };   
            updateRecord(record);
        }
    }
}