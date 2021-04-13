import { LightningElement, api } from 'lwc';

export default class ActiveSprintList extends LightningElement {
    @api records;
    @api stage;


    handleItemDrag(event) {
        const customEvent = new CustomEvent('listitemdrag', {
            detail: event.detail
        })
        this.dispatchEvent(customEvent);
    }
    handleDragOver(event) {
        event.preventDefault();
    }
    handleDrop(event) {
        const customEvent = new CustomEvent('itemdrop', {
            detail: this.stage
        })
        this.dispatchEvent(customEvent);
    }

    handleCreateBug(event) {
        const customEvent = new CustomEvent("createbug", { detail: event.detail });
        this.dispatchEvent(customEvent);
    }

    handleProgressUpdate(event) {
        const customEvent = new CustomEvent("updateprogress", { detail: event.detail });
        this.dispatchEvent(customEvent);
    }
}