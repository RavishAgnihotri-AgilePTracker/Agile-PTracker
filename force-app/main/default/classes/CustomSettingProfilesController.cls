public class CustomSettingProfilesController {

   /**
     * Returning Community Team Lead 1 User Profile
     * @param - null
     * @return - Community Team Lead 1 
     */
        
   @AuraEnabled(cacheable=true)
    public static string getCommunityTeamLead1Profile(){
     System.debug('Company_Setting__c.getInstance() => '+Community_Team_Lead__c.getInstance(UserInfo.getProfileId()).Value__c);
    return Community_Team_Lead_1__c.getInstance(UserInfo.getProfileId()).Value__c;
   }
    
      /**
     * Returning Community Team Lead User Profile
     * @param - null
     * @return - Community Team Lead  
     */
    @AuraEnabled(cacheable=true)
    public static string getCommunityTeamLeadProfile(){
    System.debug('Company_Setting__c.getInstance() => '+Community_Team_Lead__c.getInstance(UserInfo.getProfileId()).Value__c);
    return Community_Team_Lead__c.getInstance(UserInfo.getProfileId()).Value__c;
   }
    
    /**
     * Returning Community Product Owner User Profile
     * @param - null
     * @return - Community Product Owner
     */
    @AuraEnabled(cacheable=true)
    public static string getCommunityProductOwnerProfile(){
    System.debug('Company_Setting__c.getInstance() => '+Community_Product_Owner__c.getInstance(UserInfo.getProfileId()).Value__c);
    return Community_Product_Owner__c.getInstance(UserInfo.getProfileId()).Value__c;
   } 
    


}