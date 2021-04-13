import { LightningElement, wire, api } from "lwc";
import getTotalIssue from "@salesforce/apex/IssueController.getTotalIssue";

export default class DataTableDragable extends LightningElement {
  issues;
  @wire(getTotalIssue) getIssues(result){
    let backlogArray = [];
    if(result.data){
      result.data.forEach((element)=>{
        let backlog = {};
                backlog.Id = element.Id;
                backlog.Title = element.Title__c;
                backlog.backlogType = element.Backlog__c;
                backlog.issueType = element.Issue_Type__c;
                backlog.priority = element.Priority__c;
                backlog.estimatedHours = element.Estimated_Hours__c;
                if (element.Assigned_Employee__c) {
                    backlog.assignee = element.Assigned_Employee__r.Name;
                }
                if (backlog.priority === 'Low') {
                    backlog.statusCSSClass = 'slds-text-color_success slds-theme_shade slds-text-title_bold';
                } else if (backlog.priority === 'High') {
                    backlog.statusCSSClass = 'slds-text-color_error slds-theme_shade slds-text-title_bold';
                }else{
                    backlog.statusCSSClass = 'slds-theme_shade slds-text-title_bold';
                }
                backlogArray.push(backlog);
      });
      this.issues = backlogArray;
      console.log('data =========>'+JSON.stringify(this.issues));
    }
    
  };

  // @api issueMap;
  // @api dragMap;

  // // renderedCallback() {
  // //   if (!!this.issues && !!this.issues.data) {
  // //     this.issueMap = new Map();
  // //     let tempArray = JSON.parse(JSON.stringify(this.issues.data));
  // //     tempArray.forEach((arrayElement, index) => {
  // //       arrayElement.index = index;
  // //       this.issueMap.set(arrayElement.Id, arrayElement);
  // //     });
  // //     console.log(
  // //       ": ------------------------------------------------------------"
  // //     );
  // //     console.log(
  // //       "DataTableDragable -> renderedCallback -> tempArray",
  // //       JSON.stringify(tempArray)
  // //     );
  // //     console.log(
  // //       ": ------------------------------------------------------------"
  // //     );
  // //     this.issues.data = JSON.parse(JSON.stringify(tempArray));
  // //   }
  // // }

  // handleSubmit() {
  //   console.log("in submit method");
  //   let data = this.issues.data;
  //   console.log(": ----------------------------------------------");
  //   console.log(
  //     "DataTableDragable -> handleSubmit -> data",
  //     JSON.stringify(data)
  //   );
  //   console.log(": ----------------------------------------------");
  // }

  // processRowNumbers() {
  //   const trs = this.template.querySelectorAll(".myIndex");
  //   const ids = this.template.querySelectorAll(".myId");
  //   for (let i = 0; i < trs.length; i++) {
  //     let currentRowId = ids[i].innerText;
  //     let currentRowRef = this.issueMap.get(currentRowId);
  //     currentRowRef.index = i;
  //     this.issueMap.set(currentRowId, currentRowRef);
  //     trs[i].innerText = i;
  //   }
  //   this.issues.data = Array.from(this.issueMap.values());
  // }

  // onDragStart(evt) {
  //   const inputs = this.template.querySelectorAll(".mychkbox");
  //   this.dragMap = new Map();

  //   if (inputs) {
  //     for (let i = 0; i < inputs.length; i++) {
  //       if (inputs[i].checked) {
  //         let currentRow = inputs[i].parentNode.parentNode;
  //         let currentDragId = currentRow.dataset.dragId;
  //         this.dragMap.set(currentDragId, currentRow);
  //         //currentRow.classList.add("grabbed");
  //       }
  //     }
  //   }

  //   let eventRowDataId = evt.currentTarget.dataset.dragId;
  //   evt.dataTransfer.setData("dragId", eventRowDataId);
  //   evt.dataTransfer.setData("sy", evt.pageY);
  //   evt.dataTransfer.effectAllowed = "move";
  //   evt.currentTarget.classList.add("grabbed");

  //   if (this.dragMap.has(eventRowDataId)) {
  //     this.dragMap.forEach((value) => value.classList.add("grabbed"));
  //   }
  // }

  // onDragOver(evt) {
  //   evt.preventDefault();
  //   evt.dataTransfer.dropEffect = "move";
  // }

  // onDrop(evt) {
  //   evt.preventDefault();
  //   let sourceId = evt.dataTransfer.getData("dragId");

  //   const sy = evt.dataTransfer.getData("sy");
  //   const cy = evt.pageY;

  //   if (sy > cy) {
  //     if (this.dragMap.has(sourceId)) {

  //       Array.from(this.dragMap).reverse().forEach( element => {
  //         let key = element[0];
  //         const elm = this.template.querySelector(`[data-drag-id="${key}"]`);
  //         if (!!elm) {
  //           elm.classList.remove("grabbed");
  //         }
  //         evt.currentTarget.parentElement.insertBefore(elm, evt.currentTarget);
  //       });
  //     } else {
  //       const elm = this.template.querySelector(`[data-drag-id="${sourceId}"]`);
  //       if (!!elm) {
  //         elm.classList.remove("grabbed");
  //       }
  //       evt.currentTarget.parentElement.insertBefore(elm, evt.currentTarget);
  //     }
  //   } else {
  //     if (this.dragMap.has(sourceId)) {
  //       this.dragMap.forEach((value, key, map) => {
  //         const elm = this.template.querySelector(`[data-drag-id="${key}"]`);
  //         if (!!elm) {
  //           elm.classList.remove("grabbed");
  //         }
  //         evt.currentTarget.parentElement.insertBefore(
  //           elm,
  //           evt.currentTarget.nextElementSibling
  //         );
  //       });
  //     } else {
  //       const elm = this.template.querySelector(`[data-drag-id="${sourceId}"]`);
  //       if (!!elm) {
  //         elm.classList.remove("grabbed");
  //       }
  //       evt.currentTarget.parentElement.insertBefore(
  //         elm,
  //         evt.currentTarget.nextElementSibling
  //       );
  //     }
  //   }
  //   this.processRowNumbers();
  // }
}