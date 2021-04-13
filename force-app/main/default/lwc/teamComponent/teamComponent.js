import { LightningElement, wire, api, track } from 'lwc';
import teams from '@salesforce/apex/teamController.getTeamList';
import { refreshApex } from '@salesforce/apex';
const columns = [{

        label: "Team Name",
        wrapText: 'true',
        sortable: "true",
        fieldName: 'urlpath',
        type: 'url',
        typeAttributes: { label: { fieldName: 'Name' }, value: { fieldName: 'Name' }, target: 'urlpath' },
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        }
    },
    {
        label: "Active",
        wrapText: 'true',
        sortable: "true",
        fieldName: "active",
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        }
    },
    {
        label: "Team Size",
        wrapText: 'true',
        sortable: "true",
        fieldName: "teamSize",
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        }
    },
    {
        label: "Team Lead",
        wrapText: 'true',
        sortable: "true",
        fieldName: "teamLead",
        cellAttributes: {
            class: 'slds-theme_shade slds-text-title_bold',
        }
    },
    // {
    //     type: "button-icon",
    //     initialWidth: "50",
    //     typeAttributes: {
    //         iconName: "utility:edit",
    //         name: "edit"
    //     },
    //     cellAttributes: {
    //         alignment: "right",
    //         iconName: {
    //             fieldName: "icon_0",
    //             iconPosition: "right"
    //         }
    //     }
    // },
    // {
    //     type: "button-icon",
    //     initialWidth: "50",
    //     typeAttributes: {
    //         iconName: "utility:delete",
    //         name: "delete",
    //         iconClass: "slds-icon-text-error"
    //     },
    //     cellAttributes: {
    //         alignment: "right",
    //         iconName: {
    //             fieldName: "icon_1",
    //             iconPosition: "right"
    //         }
    //     }
    // }
];
export default class TeamComponent extends LightningElement {

    teamList = [];
    columns = columns;
    totalTeamList;
    enableCreateTeam = false;
    @api searchKey = '';
    teamId;
    refreshResult =[];

    connectedCallback() {
        this.currentStep = 1;
    }
    handleKeyChange(event) {
        this.searchKey = event.target.value;
    }

    @wire(teams, { searchKey: '$searchKey' }) getTeamList(result) {
        this.refreshResult = result;
        let tempArray = []
        if (result.data) {
            var urlpath = 'https://agile-ytracker-developer-edition.ap24.force.com/s/detail/';
            result.data.forEach(element => {
                let tempObj = {};
                tempObj.Id = element.Id;
                tempObj.Name = element.Name;
                tempObj.active = element.Active__c;
                tempObj.teamSize = element.Team_Size__c;
                tempObj.urlpath = urlpath + element.Id;
                if (element.Team_Lead__c) {
                    tempObj.teamLead = element.Team_Lead__r.Name;
                }
                tempArray.push(tempObj);
            })
            this.totalTeamList = tempArray;
            console.log('Team List ' + JSON.stringify(this.totalTeamList));
        } else if (result.error) {
            console.log('Error: ' + JSON.stringify(result.error));
        }
    }

    // add backlog filtered for the pagination
    handleListPagination(event) {
        this.teamList = [...event.detail.records];
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
        let parseData = JSON.parse(JSON.stringify(this.teamList));

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
        this.teamList = parseData;

    }

    handleCreateTeam() {
        console.log('create team clicked');
        this.enableCreateTeam = true;
    }

    closeModal() {
        this.enableCreateTeam = false;
    }


    teamOnSuccessHandler(event) {
        this.teamId = event.detail.id;
        console.log('Team Id ' + this.teamId);
        this.currentStep = '2';
        this.template.querySelector('div.stepone').classList.add('slds-hide');
        this.template.querySelector('div.steptwo').classList.remove('slds-hide');
        //this.template.querySelector('c-add-team-members').handleSubmit();
        //this.enableCreateTeam = false;
    }

    handleTeamSuccess() {
        console.log('handleTeamSuccess');
        this.enableCreateTeam = false;
        return refreshApex(this.refreshResult);
    }

    // goToStepTwo() {
    //     this.currentStep = '2';
    //     this.template.querySelector('div.stepOne').classList.add('slds-hide');
    //     this.template
    //         .querySelector('div.stepTwo')
    //         .classList.remove('slds-hide');
    // }
}