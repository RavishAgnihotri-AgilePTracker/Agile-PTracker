import { LightningElement,api,wire } from 'lwc';
import getObjectName from '@salesforce/apex/ProjectController.getObjectName';
export default class IssueRecordViewHeaderComponent extends LightningElement {
    @api recordId;
    objName;
    error;
    isIssue = false;
    connectedCallback(){
        this.getObjectNameMethod();
    }
    
    getObjectNameMethod(){
        getObjectName({ recordId: this.recordId }).then(result =>{
            this.objName = result;
            if(this.objName === 'Issue__c'){
                this.isIssue = true;
            }
        })
        .catch(error =>{
            this.error = error;
        })
    }

}