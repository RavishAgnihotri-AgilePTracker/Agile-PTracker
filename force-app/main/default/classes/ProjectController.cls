/**
		Apex Class: ProjectController
		Purpose: This class is used to fetch project information for displaying data in datatable
		Author: Agile PTracker team
	*/
public with sharing class ProjectController {
    

    /**
     * Returning list of Projects for displaying at Product Owner login
     * @param - searchKey
     * @return - Id, Name, Description__c,Status__c,Lead__r.Name,Total_Sprints_Count__c,Total_Backlogs_In_Project__c,Total_Completed_Sprints__c,Total_Completed_Backlogs__c,Product_Owner__r.Name
     */
    @AuraEnabled
    public static List<Project__c> getProjectList( String searchKey) {      
        String query = 'SELECT Id, Name, Description__c,Status__c,Lead__r.Name,Total_Sprints_Count__c,Total_Backlogs_In_Project__c,Total_Completed_Sprints__c,Total_Completed_Backlogs__c,Open_Backlogs_In_Project__c,Product_Owner__r.Name,(Select Total_Number_of_Backlogs__c,Number_of_Completed_Backlogs__c From Sprints__r Where isActive__c=true) FROM Project__c ';
        system.debug('query---'+query);
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' WHERE Name LIKE :key ORDER BY CreatedDate DESC ' ;
        }else{
            query += ' ORDER BY CreatedDate DESC ';
        }      
        return Database.query( query );
    }


    /**
     * Returning list of Projects for displaying at Team Lead login
     * @param - searchKey,currentUserId
     * @return - Id, Name, Description__c,Status__c,Lead__r.Name,Total_Sprints_Count__c,Total_Backlogs_In_Project__c,Total_Completed_Sprints__c,Total_Completed_Backlogs__c,Product_Owner__r.Name
     */

    @AuraEnabled
    public static List<Project__c> getLeadProjectList( String searchKey, Id currentUserId) {      
        String query = 'SELECT Id, Name, Description__c,Status__c,Lead__r.Name,Total_Sprints_Count__c,Total_Backlogs_In_Project__c,Total_Completed_Sprints__c,Total_Completed_Backlogs__c,Open_Backlogs_In_Project__c,Product_Owner__r.Name,(Select Total_Number_of_Backlogs__c,Number_of_Completed_Backlogs__c From Sprints__r Where isActive__c=true) FROM Project__c ';
        system.debug('query---'+query);
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' WHERE Lead__c=:currentUserId AND Name LIKE :key ORDER BY CreatedDate DESC ' ;
        }else{
            query += ' WHERE Lead__c=:currentUserId ORDER BY CreatedDate DESC ';
        }      
        return Database.query( query );
    }


    /**
     * Returning Profile Name as a String
     * @param - null
     * @return - profileName 
     */
    @AuraEnabled(cacheable=true)
    public static string getUserProfile() {
        Id profileId= userinfo.getProfileId();
        String profileName=[Select Id,Name from Profile where Id=:profileId].Name;
        return profileName;
    }
    

    /**
     * Returning Object Name as a String
     * @param - recordId
     * @return - objectName 
     */
    @AuraEnabled
    public static string getObjectName(Id recordId) {
        String sObjName = recordId.getSObjectType().getDescribe().getName();
        return sObjName;
    }
    

}