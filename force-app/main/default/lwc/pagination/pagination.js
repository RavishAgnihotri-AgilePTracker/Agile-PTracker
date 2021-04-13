import { LightningElement, api } from 'lwc';

export default class Pagination extends LightningElement {
    currentPage = 1
    totalRecords
    recordSize = 10
    totalPage = 1
    visibleRecords;


    //Get the recrods data
    get records() {
        return this.visibleRecords;
    }
    @api
    //Set record data - to calculate per records per page
    set records(data) {
        if (data) {
            this.totalRecords = data
            this.recordSize = Number(this.recordSize)
            this.totalPage = Math.ceil(data.length / this.recordSize)
            this.updateRecords()
        }
    }

    //Previous button action
    get disablePrevious() {
        return this.currentPage <= 1
    }

    //Next button action
    get disableNext() {
        return this.currentPage >= this.totalPage
    }

    //Previous button Handler
    previousHandler() {
        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1
            this.updateRecords()
        }
    }

    //Next button Handler
    nextHandler() {
        if (this.currentPage < this.totalPage) {
            this.currentPage = this.currentPage + 1
            this.updateRecords()
        }
    }
    
    updateRecords() {
        const start = (this.currentPage - 1) * this.recordSize
        const end = this.recordSize * this.currentPage
        this.visibleRecords = this.totalRecords.slice(start, end)
        this.dispatchEvent(new CustomEvent('update', {
            detail: {
                records: this.visibleRecords
            }
        }))
    }
}