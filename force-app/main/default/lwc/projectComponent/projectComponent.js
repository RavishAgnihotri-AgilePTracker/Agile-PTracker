import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin, CurrentPageReference } from "lightning/navigation";
import getProjectList from '@salesforce/apex/ProjectController.getProjectList';
import getLeadProjectList from '@salesforce/apex/ProjectController.getLeadProjectList';
import getUserProfile from '@salesforce/apex/ProjectController.getUserProfile';
import userId from "@salesforce/user/Id";
import getCommunityTeamLead1Profile from '@salesforce/apex/CustomSettingProfilesController.getCommunityTeamLead1Profile';
import getCommunityTeamLeadProfile from '@salesforce/apex/CustomSettingProfilesController.getCommunityTeamLeadProfile';
import getCommunityProductOwnerProfile from '@salesforce/apex/CustomSettingProfilesController.getCommunityProductOwnerProfile';




/**
 * Columns for Lead login
 */

const leadColumns = [{
        label: 'Tool Name',
        wrapText: 'true',
        sortable: "true",
        fieldName: 'urlProjectPath',
        type: 'url',
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        },
        typeAttributes: { label: { fieldName: 'Name' }, value: { fieldName: 'Name' }, target: 'urlProjectPath' }
        
    },
    { label: 'Product Owner', fieldName: 'productOwner', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } }, 
    { label: 'Lead', fieldName: 'lead', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } }, 
    { label: 'Total Sprints', fieldName: 'TotalSprints', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Completed Sprints', fieldName: 'TotalCompletedSprints', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },   
    { label: 'Total Backolgs', fieldName: 'TotalBacklogsInProject', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Completed Backlogs', fieldName: 'TotalCompletedBacklogs', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },   
    { label: 'Total Open Backlogs in Project', fieldName: 'TotalOpenBacklogsInProject', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Backlogs in Active Sprint', fieldName: 'TotalBacklogsInActiveSprint', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } }, 
    { label: 'Total Completed Backlogs in Active Sprint', fieldName: 'TotalCompletedBacklogsInActiveSprint', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Status', fieldName: 'status', sortable: "true", cellAttributes: { class: { fieldName: 'statusCSSClass' } } },
    
];

/**
 * Columns for Product Owner login
 */
const productOwnerColumns = [
    { label: 'Tool Name',
    wrapText: 'true',
    sortable: "true",
    fieldName: 'urlProjectPath',
    type: 'url',
    cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    },
    typeAttributes: { label: { fieldName: 'Name' }, value: { fieldName: 'Name' }, target: 'urlProjectPath',cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } } },
    { label: 'Product Owner', fieldName: 'productOwner', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Lead', fieldName: 'lead', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Sprints', fieldName: 'TotalSprints', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Completed Sprints', fieldName: 'TotalCompletedSprints', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },  
    { label: 'Total Backlogs', fieldName: 'TotalBacklogsInProject', sortable: "true",cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Completed Backlogs', fieldName: 'TotalCompletedBacklogs', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Open Backlogs in Project', fieldName: 'TotalOpenBacklogsInProject', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    
    { label: 'Total Backlogs in Active Sprint', fieldName: 'TotalBacklogsInActiveSprint', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },
    { label: 'Total Completed Backlogs in Active Sprint', fieldName: 'TotalCompletedBacklogsInActiveSprint', sortable: "true", cellAttributes: {
        class: 'slds-theme_shade slds-text-title_bold',
    } },      
    { label: 'Status', fieldName: 'status', sortable: "true", cellAttributes: { class: { fieldName: 'statusCSSClass' } } },
    {
        type: 'button-icon',
        initialWidth: '50',
        typeAttributes: {
            iconName: 'utility:edit',
            name: 'edit'
        },
        cellAttributes: {
            alignment: "right",
            iconName: {
                fieldName: "icon_0",
                iconPosition: "right"
            }
        }
    }
];

export default class ProjectComponent extends NavigationMixin(LightningElement) {

    @track records;
    @track dataList;
    @api projectId;
    @wire(CurrentPageReference) pageRef;
    currentUserId = userId;
    isLead = false;
    isProductOwner = false;
    createProject = false;
    editProject = false;
    hasProject = false;
    isLoading = false;
    profileName;
    columns;
    error;
    communityTeamLead1Profile;
    communityTeamLeadProfile;
    communityProductOwnerProfile;

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


    connectedCallback() {
        this.getProfileData();
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
                    this.columns = leadColumns;
                    this.getProjectDataForLead();
                } else if (this.profileName === this.communityProductOwnerProfile) {
                    this.isProductOwner = true;
                    this.columns = productOwnerColumns;
                    this.getAllProjectData();
                }
            })
            .catch(error => {
                console.log('Error ' + error);
            })
    }

   

    getAllProjectData(searchKey) {
        this.isLoading = true;
        getProjectList({ searchKey: searchKey })
            .then(data => {
                let currentData = [];
                var urlpath = 'https://agile-ytracker-developer-edition.ap24.force.com/s/detail/';
                data.forEach(row => {
                    let rowData = {};
                    rowData.Id = row.Id;
                    rowData.Name = row.Name;
                    rowData.status = row.Status__c;
                    rowData.leadId = row.Lead__c;
                    rowData.lead = row.Lead__r.Name;
                    rowData.urlProjectPath = urlpath + rowData.Id;
                    rowData.TotalSprints = row.Total_Sprints_Count__c;
                    rowData.productOwner = row.Product_Owner__r.Name;
                    rowData.TotalBacklogsInProject = row.Total_Backlogs_In_Project__c;
                    rowData.TotalCompletedBacklogs = row.Total_Completed_Backlogs__c;
                    rowData.TotalCompletedSprints = row.Total_Completed_Sprints__c;
                    rowData.TotalOpenBacklogsInProject = row.Open_Backlogs_In_Project__c;                   
                    if(row.Sprints__r){
                        rowData.TotalBacklogsInActiveSprint = row.Sprints__r[0].Total_Number_of_Backlogs__c;
                        rowData.TotalCompletedBacklogsInActiveSprint = row.Sprints__r[0].Number_of_Completed_Backlogs__c;
                    }
                    if (rowData.status === 'Complete') {
                        rowData.statusCSSClass = 'slds-text-color_success slds-theme_shade slds-text-title_bold';
                    } else if (rowData.status === 'Not Started') {
                        rowData.statusCSSClass = 'slds-text-color_error slds-theme_shade slds-text-title_bold';
                    }else{
                        rowData.statusCSSClass = 'slds-theme_shade slds-text-title_bold';
                    }
                    currentData.push(rowData);
                });
                this.records = currentData;
                this.ALL_RecordsForFilter = currentData;
                console.log('data - '+JSON.stringify(data));
                if (currentData.length) {
                    this.hasProject = true;
                } else {
                    this.hasProject = false;
                }
                this.isLoading = false;
                
            })
            .catch(error => {
                console.log('Error in all project list ' + JSON.stringify(error));
                this.isLoading = false;
            })

            
    }

    /**
     * method to fetch list of projects for Lead  
     */
    getProjectDataForLead(searchKey) {
        this.isLoading = true;
        getLeadProjectList({ searchKey: searchKey, currentUserId: this.currentUserId })
            .then(data => {
                let currentData = [];
                var urlpath = 'https://agile-ytracker-developer-edition.ap24.force.com/s/detail/';
                data.forEach(row => {
                    let rowData = {};
                    rowData.Id = row.Id;
                    rowData.Name = row.Name;
                    rowData.status = row.Status__c;
                    rowData.leadId = row.Lead__c;
                    rowData.lead = row.Lead__r.Name;
                    rowData.urlProjectPath = urlpath + rowData.Id;
                    rowData.TotalSprints = row.Total_Sprints_Count__c;
                    rowData.productOwner = row.Product_Owner__r.Name;
                    rowData.TotalBacklogsInProject = row.Total_Backlogs_In_Project__c;
                    rowData.TotalCompletedBacklogs = row.Total_Completed_Backlogs__c;
                    rowData.TotalCompletedSprints = row.Total_Completed_Sprints__c;
                    rowData.TotalOpenBacklogsInProject = row.Open_Backlogs_In_Project__c;
                    if(row.Sprints__r){
                        rowData.TotalBacklogsInActiveSprint = row.Sprints__r[0].Total_Number_of_Backlogs__c;
                        rowData.TotalCompletedBacklogsInActiveSprint = row.Sprints__r[0].Number_of_Completed_Backlogs__c;
                    }
                    console.log('row==========>'+JSON.stringify(row))
                    if (rowData.status === 'Complete') {
                        rowData.statusCSSClass = 'slds-text-color_success slds-theme_shade slds-text-title_bold';
                    } else if (rowData.status === 'Not Started') {
                        rowData.statusCSSClass = 'slds-text-color_error slds-theme_shade slds-text-title_bold';
                    }else{
                        rowData.statusCSSClass = 'slds-theme_shade slds-text-title_bold';
                    }
                    currentData.push(rowData);
                });
                this.records = currentData;
                this.ALL_RecordsForFilter = currentData;

                if (currentData.length) {
                    this.hasProject = true;
                } else {
                    this.hasProject = false;
                }
                this.isLoading = false;
                console.log('data - '+JSON.stringify(data));
            })
            .catch(error => {
                console.log('Error in lead project list ' + JSON.stringify(error));
                this.isLoading = false;
            })
    }

    // method to open create project modal
    handleCreate() {
        this.createProject = true;
    }

    // method to close create project modal and edit project modal
    closeModal() {
        this.createProject = false;
        this.editProject = false;
    }

    // method to handle project create success 
    handleProjectCreateSuccess() {
        this.showToast('Success', 'Project Created Successfully', 'success');
        this.closeModal();
        this.getAllProjectData();
    }

    // method to handle project edit success 
    handleProjectEditSuccess() {
        this.showToast('Success', 'Project Edited Successfully', 'success');
        this.closeModal();
        this.getAllProjectData();
    }


    // method to handle row actions
    handleRowAction(event) {
        this.projectId = event.detail.row.Id;
        let lead;
        this.dataList.forEach(ele => {
            if (ele.Id === this.projectId) {
                lead = ele.leadId;
            }
        })

        let actionName = event.detail.action.name;

        let recordData = {};
        recordData.profileName = this.profileName;
        recordData.lead = lead;
        recordData.isLead = this.isLead;
        recordData.isProductOwner = this.isProductOwner;
        recordData.projectId = this.projectId;

        switch (actionName) {
            case "view":
                this[NavigationMixin.Navigate]({
                    "type": "standard__webPage",
                    "attributes": {
                        "url": "https://agile-ytracker-developer-edition.ap24.force.com/s/project/" + this.projectId
                    }
                });

                sessionStorage.setItem('recordData', JSON.stringify(recordData));
                break;

            case "edit":
                this.editProject = true;
                break;

            default:
        }

    }

    // add projects filtered for the pagination
    handleListPagination(event) {
        this.dataList = [...event.detail.records];
    }

    //Sorting Data - 
    handleSortdata(event) {
        // field name
        this.sortBy = event.detail.fieldName;

        // sort direction
        this.sortDirection = event.detail.sortDirection;

        // calling sortdata function to sort the data based on direction and selected field
        this.sortData(event.detail.fieldName, event.detail.sortDirection);
    }

    //Sorting Data - with Params
    sortData(fieldname, direction) {
        // serialize the data before calling sort function
        let parseData = JSON.parse(JSON.stringify(this.dataList));

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
        this.dataList = parseData;

    }

    //Filtering of array data based on the filter
    ALL_RecordsForFilter = [];

    get options() {
        return [
            { label: "All", value: "All" },
            { label: "Not Started", value: "Not Started" },
            { label: "In Progress", value: "In Progress" },
            { label: "Completed", value: "COMPLETED" }
        ];
    }

    handleChange(event) {
        //let allDataArray = [];
        let inputValue = event.detail.value;
        const regex = new RegExp(`^${inputValue}`, "i");

        if (inputValue !== 'All') {
            this.records = this.ALL_RecordsForFilter.filter(row => regex.test(row.status));
        } else {
            this.records = this.ALL_RecordsForFilter;
        }
        (this.records.length) ? (this.hasProject = true) : (this.hasProject = false);
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

    @api searchKey = '';

    handleKeyChange( event ) {
        this.searchKey = event.target.value;
        if(this.isLead){
            this.getProjectDataForLead(this.searchKey);
        }else if(this.isProductOwner){
            this.getAllProjectData(this.searchKey);
        }
        
        
    }

}