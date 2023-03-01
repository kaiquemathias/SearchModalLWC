import { LightningElement, api, wire, track } from 'lwc';
import getRecords from '@salesforce/apex/SearchModalController.getRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SearchModal extends LightningElement {
    @api objectApiName;
    @api columns;
    @api whereClause;
    @api searchText;
    @api title;
    @api functionRecordSelect;

    @track data = [];
    @track dataWithAllColumns = [];
    @track modalColumns=[];

    fields = [];
    
    connectedCallback() {
        this.columns.forEach(column => {
            this.fields.push(column.fieldName);
            if(column.isVisible){
                this.modalColumns.push(column);
            }
        });
        this.searchData();
    }

    search(searchText) {
        this.searchText = searchText;
        this.searchData();
    }

    handleSearch(event) {
        this.searchText = event.target.value;
        this.searchData();
    }

    searchData() {
        this.data = [];
        if (this.searchText.length >= 4) {
            getRecords({    
                searchString: '%' + this.searchText + '%',
                objectApiName: this.objectApiName,
                columns: this.fields,
                whereClause: this.whereClause.replaceAll('{0}',this.searchText),
                maxRecords: 10
            })
                .then(result => {
                    const dataArray = [];
                    const dataArrayWithAllColumns = [];
                    result.forEach(record => {
                        const rowData = [];
                        const rowDataWithAllColumns = [];
                        this.columns.forEach(column => {
                            const columnData = {};
                            columnData.fieldApiName = column.fieldName;
                            columnData.value = record[column.fieldName];
                            if(column.isVisible){
                                rowData.push(columnData);
                            }
                            rowDataWithAllColumns.push(columnData);
                        });
                        // Adiciona o Id do registro como um atributo na matriz rowData
                        rowData.Id = record.Id;
                        dataArray.push(rowData);

                        rowDataWithAllColumns.Id = record.Id;
                        dataArrayWithAllColumns.push(rowDataWithAllColumns);
                    });
                    this.data = dataArray;
                    this.dataWithAllColumns = dataArrayWithAllColumns;
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.message,
                            variant: 'error'
                        })
                    );
                });
        }
    }

    closeModal(event) {
        this.dispatchEvent(new CustomEvent('closemodal'));
    }

    handleRowDoubleClick(event) {
        let selectedDataId = event.currentTarget.dataset.recordId;
        let selectedData = this.dataWithAllColumns.find(record => record.Id === selectedDataId);
        this.closeModal();
        const selectedEvent = new CustomEvent('recordselect', {
            detail: {
                record: selectedData,
                functionName: this.functionRecordSelect
            }
        });
        this.dispatchEvent(selectedEvent);
    }

}