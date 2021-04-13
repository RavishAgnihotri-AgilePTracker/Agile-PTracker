public with sharing class SprintController {
    
    /**
     * Returning list of Sprint related to Project
     * @param - projectId
     * @return - Id, Name, Stage__c,isActive__c
	*/
    @AuraEnabled(cacheable=true)
    public static List<Sprint__c> getSprintList(Id projectId) {
        List<Sprint__c> sprints = [SELECT Id, Name, Stage__c,isActive__c,Start_Date__c,Target_Date__c,Sprint_Approval_Status__c,Number_of_Completed_Backlogs__c  FROM Sprint__c WHERE Project__c=:projectId ORDER BY CreatedDate DESC];
    	return sprints;
    }

    /**
     * Returning list of Active Sprint related to Project
     * @param - projectId
     * @return - Id, Name, Stage__c, Start_Date__c, Target_Date__c
	*/
    @AuraEnabled(cacheable=true)
    public static List<Sprint__c> getSprintsInProject(Id projectId){
        List<Sprint__c> activeSprints = [select Id, Name, Stage__c, Start_Date__c, Target_Date__c, Cumulative_Progress__c, isActive__c, LastModifiedDate from Sprint__c where (Project__c =: projectId AND Stage__c!= 'COMPLETED')];
        return activeSprints;
    }

    /**
     * Returning list of Pending Approval Sprint related to Project
     * @param - projectId
     * @return - Id, Name, Stage__c, Start_Date__c, Target_Date__c
	*/
    @AuraEnabled
    public static List<Sprint__c> getPendingApprovalSprintList(Id projectId) {
        List<Sprint__c> pendingApprovalSprints = [SELECT Id, Name, Stage__c,isActive__c,Start_Date__c,Target_Date__c,Sprint_Approval_Status__c  FROM Sprint__c WHERE (Project__c=:projectId AND Sprint_Approval_Status__c='Pending')];
    	return pendingApprovalSprints;
    }
}