public with sharing class FileController {

    /* 
    * Prameters : contentDocumentId, type-Id
    * Functionality : The selected file becomes downloadable
    * Return : ContentDistribution of selected File.
   */
   @AuraEnabled
   public static ContentDistribution getContentDistributionForFile(Id contentDocumentId){

       ContentVersion contentVersion = [ SELECT Id, ContentDocumentId, IsMajorVersion, IsLatest
                                         FROM ContentVersion 
                                         WHERE ContentDocumentId =: contentDocumentId
                                           AND IsLatest = true 
                                         LIMIT 1 ];

       List<ContentDistribution> contentDistribution = [ SELECT Id, Name, ContentDownloadUrl, ContentVersionId 
                                                         FROM ContentDistribution 
                                                         WHERE ContentVersionId =: contentVersion.Id ];
       if (!contentDistribution.isEmpty()) {
           return contentDistribution[0];
       }
       // else create new contentDistribution
       ContentDistribution newContentDistribution = new ContentDistribution( Name = 'Test',
                                                                             ContentVersionId = contentVersion.Id,
                                                                             PreferencesAllowViewInBrowser = true );
       insert newContentDistribution;

       return  [ SELECT Id, Name, ContentDownloadUrl, ContentDocumentId 
                 FROM ContentDistribution 
                 WHERE Id =: newContentDistribution.Id 
                 LIMIT 1 ];
   }

  /* 
    * Prameters : recordId, type-Id
    * Functionality : Fetch list of files related to record
    * Return : List of files
   */ 
   @AuraEnabled(cacheable=true)
   public static List<file> getRelatedFiles(Id recordId){
       List<File> files = new List<File>();

       for(ContentDocumentLink conLink : [SELECT 
                                               ContentDocument.Id, 
                                               ContentDocument.Title, 
                                               ContentDocument.CreatedDate, 
                                               ContentDocument.FileType                                            
                                                   FROM ContentDocumentLink 
                                                       WHERE LinkedEntityId =: recordId]){
           File file = new File();
           file.Title = conLink.ContentDocument.Title;
           file.Id = conLink.ContentDocument.Id;
           file.CreatedDate = conLink.ContentDocument.CreatedDate;
           file.Type = conLink.ContentDocument.FileType;
           files.add(file);
       }
       return files;
   }

   /* 
    * Prameters : idParent------type-Id, strFileName---------type-String, base64Data------type-String
    * Functionality : Save the uploaded file to related record
    * Return : ContentVersion.
   */
   @AuraEnabled
   public static ContentVersion saveFile(Id idParent, String strFileName, String base64Data) {
       // Decoding base64Data
       base64Data = EncodingUtil.urlDecode(base64Data, 'UTF-8');
       
       // inserting file
       ContentVersion cv = new ContentVersion();
       cv.Title = strFileName;
       cv.PathOnClient = '/' + strFileName;
       cv.FirstPublishLocationId = idParent;
       cv.VersionData = EncodingUtil.base64Decode(base64Data);
       cv.IsMajorVersion = true;
       Insert cv;
       return cv;
   }

   /**
    * File Class
    */
   public class File{
       @AuraEnabled public String Title;
       @AuraEnabled public String Type;
       @AuraEnabled public Id Id;
       @AuraEnabled public Datetime CreatedDate;
   }

}