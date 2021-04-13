public with sharing class IssueController {
    
    /**
     * Returning list of backlogs related to Project and based on type
     * @param - Id projectId, String type
     * @return - Id, Name, Project__r.Name, Issue_Type__c, Title__c, Priority__c,Estimated_Hours__c, Story_Point__c, Assignee__r.Name,Assigned_Employee__r.Name
	*/
    // @AuraEnabled(cacheable=true)
    // public static List<Issue__c> getBacklogs(Id projectId){
    //     List<Issue__c> backlogs = [select Id, Name, Project__r.Name, Backlog__c, Issue_Type__c, Title__c, Priority__c,Estimated_Hours__c, Story_Point__c, Assignee__r.Name,Assigned_Employee__r.Name from Issue__c where (Project__c =: projectId) ORDER BY CreatedDate DESC];
    //     return backlogs;
    // }

    @AuraEnabled(cacheable=true)
    public static List<Issue__c> getBacklogs( Id projectId,String searchKey) {
       
        String query = 'SELECT Id, Name, Project__r.Name, Backlog__c, Issue_Type__c, Title__c, Priority__c,Estimated_Hours__c, Story_Point__c, Assignee__r.Name,Assigned_Employee__r.Name FROM Issue__c ';
        system.debug('query---'+query);
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' WHERE Project__c =: projectId AND Title__c LIKE :key ORDER BY CreatedDate DESC' ;
        }else{
            query += ' WHERE Project__c =: projectId ORDER BY CreatedDate DESC ';
        }      
        return Database.query( query );
    }
    
    /**
     * Returning list of backlogs related to Sprint
     * @param - Id sprintId
     * @return - Id, Name, stage__c, Sprint__c, Issue_Type__c, Progress__c, Title__c, Priority__c, Story_Point__c, Comment__c, Assignee__r.Name, Assigned_Employee__r.Name
	*/
    @AuraEnabled
    public static List<Issue__c> getBacklogsForActiveSprint(Id sprintId){
        List<Issue__c> backlogs = [select Id, Name, stage__c, Sprint__c, Issue_Type__c, Progress__c, Title__c, Priority__c, Story_Point__c, Comment__c, Assignee__r.Name, Assigned_Employee__r.Name, Estimated_Hours__c, Have_Test_Script__c  from Issue__c where (Sprint__c =: sprintId) ];
        return backlogs;
    }

    
     /**
     * Returning list of backlogs related to Project
     * @param - Id projectId
     * @return - Id, Title__c,Priority__c
	*/
    
    @AuraEnabled(cacheable=true)
    public static List<Issue__c> getBacklogList(Id projectId) {
        return [SELECT Id, Title__c,Priority__c,Estimated_Hours__c,Backlog__c FROM Issue__c WHERE (Sprint__c=null AND Project__c =:projectId) ORDER BY CreatedDate DESC];
    }
    
    
     /**
     * Returning list of backlogs related to Sprint
     * @param - Id filterSprintId
     * @return - Id, Title__c,Priority__c
	*/
    
    @AuraEnabled(cacheable=true)
    public static List<Issue__c> getFilterBacklogList(Id filterSprintId) {       
        return [SELECT Id, Title__c,Priority__c  FROM Issue__c WHERE Sprint__c=:filterSprintId ORDER BY CreatedDate DESC];
    }
    
    /**
     * Returning list of technical backlogs related to Sprint
     * @param - Id productBacklogId, String searchKey
     * @return - Id, Title__c,Priority__c
	*/   

    @AuraEnabled(cacheable=true)
    public static List<Issue__c> getRelatedTechnicalBacklogList( Id productBacklogId,String searchKey) {
       
        String query = 'SELECT Id,Name, stage__c, Issue_Type__c, Title__c, Priority__c,Backlog__c, Assignee__r.Name, Assigned_Employee__r.Name,Estimated_Hours__c FROM Issue__c WHERE Related_Business_Issue__c=:productBacklogId ';
        system.debug('query---'+query);
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' AND Title__c LIKE :key ORDER BY CreatedDate DESC' ;
        }else{
            query += ' ORDER BY CreatedDate DESC ';
        }      
        return Database.query( query );
    }

    @AuraEnabled(cacheable = true)
        public static List<Issue__c> getTotalIssue(){
            return [SELECT Id,Name, stage__c, Issue_Type__c, Title__c, Priority__c,Backlog__c, Assignee__r.Name, Assigned_Employee__r.Name,Estimated_Hours__c FROM Issue__c 
                    ORDER BY CreatedDate DESC];
        }
}