import { LightningElement,api,wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getTeamMembersList from '@salesforce/apex/teamController.getTeamMembersList'
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import { refreshApex } from '@salesforce/apex';
import { deleteRecord } from 'lightning/uiRecordApi';
import Lead from '@salesforce/schema/Team__c.Team_Lead__c';
import getLeadEmail from '@salesforce/apex/teamController.getLeadEmail'


const columns = [
    { label: 'Number', fieldName: 'Name'},
    { label: 'Name', fieldName: 'teamMember'},    
    { label: 'Role', fieldName: 'role'},
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

export default class TeamRecordViewComponent extends NavigationMixin(LightningElement) {
    @api recordId;
    teamMemberList;
    columns = columns;
    editTeam = false;
    addTeamMember = false;
    refreshResult =[];
    leadId;
    email;
    
    @wire(getRecord, { recordId: '$recordId', fields: [Lead] }) leadData({ error, data }) {
        if (data) {
            this.leadId = data.fields.Team_Lead__c.value;
            console.log('Lead - '+this.leadId);
        } else if (error) {
            console.log("Error " + JSON.stringify(error));
        }
        this.getLeadEmailAddress(this.leadId);
    }

    getLeadEmailAddress(leadId){
        getLeadEmail({leadId:leadId})
        .then(data => {
            console.log('Email - '+JSON.stringify(data));
        }).catch(error => {
            console.log('Error - ' + JSON.stringify(error));
        })
    }


    @wire(getTeamMembersList, {recordId:'$recordId'}) getTeamMembers(result){
        this.refreshResult = result;
        let tempArray = [];
        if(result.data){
            result.data.forEach((element)=>{
                let tempObject={};
                tempObject.Id = element.Id;
                tempObject.Name = element.Name;
                tempObject.allocation = element.Allocation__c;
                tempObject.role = element.Role__c;
                if (element.Employee__c) {
                    tempObject.teamMember = element.Employee__r.Name;
                }
                tempArray.push(tempObject);
            });
            this.teamMemberList = tempArray;
        }       
    }


    handleEdit(){
        this.editTeam = true;
    }

    closeModal(){
        this.editTeam = false;
        this.addTeamMember = false;
    }

    handleTeamEditSuccess(){
        this.showToast('Success', 'Team Edited Successfully', 'success');
        this.closeModal();
    }


    handleAddTeamMember(){
        this.addTeamMember = true;
    }

    handleTeamMemberSuccess(){
        this.showToast('Success', 'Team Member Added Successfully', 'success');
        this.closeModal();
        return refreshApex(this.refreshResult);
    }

    // row-action handler for edit and delete actions of datatable
    handleRowAction(event) {
        let actionName = event.detail.action.name;
        this.rowId = event.detail.row.Id;

        switch (actionName) {
            case "delete":
                this.delete(this.rowId)
                break;

            default:
        }
    }

    //method to delete the selected record
    delete(rowId) {
        deleteRecord(rowId)
            .then((data) => {
                this.showToast("Success", "Team Member Removed", "success");
                return refreshApex(this.refreshResult);
            })
            .catch((error) => {
                this.showToast("Error", error.message.body, "error");
            });
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