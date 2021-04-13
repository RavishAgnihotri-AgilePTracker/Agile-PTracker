import { api, LightningElement, track } from 'lwc';



export default class AddTeamMembers extends LightningElement {
    keyIndex = 0;
    @api teamId;
    @track itemList = [{
        id: 0
    }];

    connectedCallback() {
        console.log('in team member team id ' + this.teamId);
    }

    addRow() {
        ++this.keyIndex;
        var newItem = [{ id: this.keyIndex }];
        this.itemList = this.itemList.concat(newItem);
    }

    removeRow(event) {
        if (this.itemList.length >= 2) {
            this.itemList = this.itemList.filter(function(element) {
                return parseInt(element.id) !== parseInt(event.target.accessKey);
            });
        }
    }

    handleSubmit() {
        var isVal = true;
        // this.template.querySelectorAll('lightning-input-field').forEach(element => {
        //     isVal = isVal && element.reportValidity();
        // });
        if (isVal) {
            console.log('handle submit if 1 ');
            this.template.querySelectorAll('lightning-record-edit-form').forEach(element => {
                element.submit();
            });
            console.log('handle submit if 2');
        } else {
            console.log('handle submit error');
        }
       
    }

    handleSuccess(event) {
        console.log('handle success');
        const cusEvent = new CustomEvent('teammembersuccess', { detail: true });
        this.dispatchEvent(cusEvent);
    }


}