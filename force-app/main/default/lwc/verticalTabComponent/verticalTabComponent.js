import { api, LightningElement, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import Name from '@salesforce/schema/Project__c.Name';
import Lead from '@salesforce/schema/Project__c.Lead__c';
import ProjectDescription from '@salesforce/schema/Project__c.Description__c';
import getCommunityTeamLead1Profile from '@salesforce/apex/CustomSettingProfilesController.getCommunityTeamLead1Profile';
import getCommunityTeamLeadProfile from '@salesforce/apex/CustomSettingProfilesController.getCommunityTeamLeadProfile';
import getCommunityProductOwnerProfile from '@salesforce/apex/CustomSettingProfilesController.getCommunityProductOwnerProfile';
import getUserProfile from '@salesforce/apex/ProjectController.getUserProfile';

const fields = [Name, Lead, ProjectDescription];
export default class VerticalTabComponent extends NavigationMixin(LightningElement) {

    @api recordId;
    @wire(CurrentPageReference) pageRef;
    projectId;
    lead;
    name;
    projectDescription;
    isLead;
    isProductOwner;
    communityTeamLead1Profile;
    communityTeamLeadProfile;
    communityProductOwnerProfile;
    showAgilePTrackerInfo = false;

    // method to open Agile PTRacker info page 
    onClickInfo() {
        window.open("https://agile-ytracker-developer-edition.ap24.force.com/s/agile-ptracker-info");
    }


    // get Project Name, Lead Id and Description
    @wire(getRecord, { recordId: '$projectId', fields: [Name, Lead, ProjectDescription] }) projectData({ error, data }) {
        console.log("p data " + JSON.stringify(data));
        if (data) {
            this.lead = data.fields.Lead__c.value;
            this.name = data.fields.Name.value;
            this.projectDescription = data.fields.Description__c.value;
        } else if (error) {
            console.log("Error " + JSON.stringify(error));
        }
    }


    // Setting profiles from Custom Setting
    @wire(getCommunityTeamLead1Profile) getCommunityTeamLead1Profile(result) {
        this.communityTeamLead1Profile = result.data;
    }

    @wire(getCommunityTeamLeadProfile) getCommunityTeamLeadProfile(result) {
        this.communityTeamLeadProfile = result.data;
    }


    @wire(getCommunityProductOwnerProfile) getCommunityProductOwnerProfile(result) {
        this.communityProductOwnerProfile = result.data;
    }

    // // get Project Name
    // get name() {
    //     return getFieldValue(this.project.data, Name);
    // }

    // // get Lead Id
    // get lead() {
    //     return getFieldValue(this.project.data, Lead);
    // }

    // // get Project Description
    // get ProjectDescription() {
    //     return getFieldValue(this.project.data, ProjectDescription);
    // }

    //Get data from ProjectComponent
    connectedCallback() {
        this.projectId = this.recordId;
        this.getProfileData();
        console.log('desc - ' + JSON.stringify(ProjectDescription));
    }

    /**
     * method to fetch profile name of logged in user
     */
    getProfileData() {
        getUserProfile()
            .then(data => {
                this.profileName = data;
                if (this.profileName === this.communityTeamLeadProfile || this.profileName === this.communityTeamLead1Profile) {
                    this.isLead = true;
                    //console.log('in lead ' + this.profileName);
                } else if (this.profileName === this.communityProductOwnerProfile) {
                    this.isProductOwner = true;
                    //console.log('in profile name ' + this.profileName);
                }
            })
            .catch(error => {
                console.log('Error ' + error);
            })
    }

}