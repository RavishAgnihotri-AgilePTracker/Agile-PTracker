public with sharing class teamController {
    
    @AuraEnabled(cacheable=true)
    public static List<Team__c> getTeamList(String searchKey) {
       
        String query = 'Select Name, Active__c, Scrum_Master__r.Name, Team_Size__c, Team_Lead__r.Name from Team__c ';
        system.debug('query---'+query);
        if ( searchKey != null && searchKey != '' ) {
            String key = '%' + searchKey + '%';
            query += ' WHERE Name LIKE :key ORDER BY CreatedDate DESC' ;
        }else{
            query += ' ORDER BY CreatedDate DESC ';
        }      
        return Database.query( query );
    }

    @AuraEnabled(cacheable=true)
    public static List<Employee__c> getEmployees() {
        List<Employee__c>  employees = [select Id, Name, Email__c, Manager__c, Work_Status__c from Employee__c where Work_Status__c = 'Bench'];
        return employees;
    }

    @AuraEnabled(cacheable=true)
    public static List<Team_Member__c> getTeamMembersList(Id recordId){
        return [SELECT Id,Name,Employee__r.Name,Allocation__c,Role__c FROM Team_Member__c WHERE Team__c =:recordId ];
    }

    @AuraEnabled(cacheable=true)
    public static List<User> getLeadEmail(Id leadId){
        return [SELECT Email FROM User WHERE Id =:leadId ];
    }
}