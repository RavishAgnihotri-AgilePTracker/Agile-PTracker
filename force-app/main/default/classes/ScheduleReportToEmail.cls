global class ScheduleReportToEmail implements Schedulable, Database.AllowsCallouts {
    
    /*
		execute method to get Email body and Product Owner users to send mail
	*/
    global void execute(SchedulableContext sc) {
        List<String> receivers = new List<String>();
        //receivers.add('ravish.agnihotri@yash.com'); 
		//receivers.add('vineet.parolia@yash.com');
        //receivers.add('shailender.gupta@yash.com');
        //receivers.add('rahul.chaurasia@yash.com');
        //receivers.add('rahulc2345@gmail.com');
        //receivers.add('rahul.chaurasia@yash.com');
        //receivers.add('dubeypalash02@gmail.com');
        receivers.add('palash.dubey@yash.com');
        List<Issue__c> issues = [select Id, Name, Title__c, Sprint__r.Name, Project__r.Name, Progress__c, Assigned_Employee__r.Name, Estimated_Hours__c, Assignee__r.Name,Remaining_Hours__c FROM Issue__c WHERE Sprint__r.isActive__c = true ORDER BY Project__r.Name];
        String emailBody = customEmailTemplate();
                
      //   List<User> productOwners = [select Id, Email from User Where Profile.Name = 'Community Product Owner' AND IsActive = true];
      //   for(User u: productOwners){
      //      receivers.add(u.Email);
      //   }
       
		sendReportViaEmail(emailBody, receivers);
    }
    
    // method to send email
    @future(callout=true)
    public static void sendReportViaEmail (String emailBody, List<String> receivers) {
       	Report reports = [select Id, Name from Report Where DeveloperName = 'SFDC_Sprint_Progress_Report_xSF' Limit 1];
       	Id ReportId = reports.Id;
            ApexPages.PageReference report = new ApexPages.PageReference('/'+ReportId+'?csv=1&isdtp=p1');
            Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
            Messaging.EmailFileAttachment attachment = new Messaging.EmailFileAttachment();        
            attachment.setFileName('Active_Sprints_Progress.csv');
            attachment.setBody(report.getContent());
            attachment.setContentType('text/csv');
            
            try{
                message.setToAddresses(receivers);
                message.setSubject('Weekly Report of Current Active Sprints');
                message.setHtmlBody(emailBody);
                message.setFileAttachments(new Messaging.EmailFileAttachment[] { attachment } );
                Messaging.sendEmail(new Messaging.SingleEmailMessage[] { message });
                
            }catch(Exception ex){
                system.debug('Error ' + ex.getMessage());
            }
            System.debug('Email call made ' + Limits.getEmailInvocations() + ' out of ' + Limits.getLimitEmailInvocations() + ' allowed'); 
    }

 /*
	Email Template body
*/
    public static String customEmailTemplate(){

       List<Issue__c> issues = [select Id, Name, Title__c, Sprint__r.Name, Sprint__r.Target_Date__c, Sprint__r.Start_Date__c, Sprint__r.Stage__c, Sprint__r.Cumulative_Progress__c, Sprint__r.PreviousDayCumulativeProgress__c ,Project__r.Name, Progress__c, Assigned_Employee__r.Name,Assignee__r.Name, Estimated_Hours__c, Remaining_Hours__c FROM Issue__c WHERE Sprint__r.isActive__c = true ORDER BY Project__r.Name DESC];
       //List<Issue__c> reportData = new List<Issue__c>();
       //Map<String, Issue__c> reportMap = new Map<String, Issue__c>();
      /* for(Issue__c i: issues){
            //i.Sprint__r.Start_Date__c = (Date) i.Sprint__r.Start_Date__c;
            //i.Sprint__r.Target_Date__c = (Date) i.Sprint__r.Target_Date__c;
			Date stDate = date.newinstance(i.Sprint__r.Start_Date__c.year(), i.Sprint__r.Start_Date__c.month(), i.Sprint__r.Start_Date__c.day());
            Date tarDate = date.newinstance(i.Sprint__r.Target_Date__c.year(), i.Sprint__r.Target_Date__c.month(), i.Sprint__r.Target_Date__c.day());
           	i.Sprint__r.Start_Date__c = stDate;
           i.Sprint__r.Target_Date__c = tarDate;
           //reportMap.put(i.Project__r.Name, i);
           reportData.add(i);
        }
		system.debug('report map ' + reportData);
        */
       String finalEmailBody='';
        try{
          finalEmailBody+='<html xmlns="http://www.w3.org/1999/xhtml" lang="en-GB"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title></title><meta name="viewport" content="width=device-width, initial-scale=1.0"/>';
		   finalEmailBody+='<style type="text/css">a[x-apple-data-detectors]{color:inherit!important}@media all and (max-width:599px){.smarttable{border:0}.smarttable thead{display:none;border:none;height:0;margin:0;overflow:hidden;padding:0;max-width:0;max-height:0}.smarttable tr{display:block;width:90%;margin:20px auto}.smarttable td{border-bottom:1px solid #ddd;display:block;font-size:15px;text-align:center}}.smarttable tbody tr:nth-child(2n){background-color:#f2f2f2}.smarttable thead{text-align:left}.smarttable th{background-color:#4caf50;color:#fff}</style></head>';
       	   finalEmailBody+='<body style="margin: 0; padding: 0;">';
                finalEmailBody+='<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">';
                 finalEmailBody+='<tr>';
                    finalEmailBody+='<td style="padding: 20px 0 30px 0;">';
                       finalEmailBody+='<table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc;min-width:700px;">';
                          finalEmailBody+='<tr>';
                             finalEmailBody+='<td align="right" bgcolor="#050a0d" style="">';
                                finalEmailBody+='<img src="https://sfdcmedia.s3.ap-south-1.amazonaws.com/yash-logo.PNG" alt="Yash Technologies." width="100" height="62" style="display: block;" />';
                             finalEmailBody+='</td>';
                          finalEmailBody+='</tr>';
                           finalEmailBody+='<tr>';
                           finalEmailBody+='</tr>';
                          finalEmailBody+='<tr>';
                             finalEmailBody+='<td bgcolor="#ffffff" style="padding: 30px 30px 30px 30px;">';
                                finalEmailBody+='<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">';
                                   finalEmailBody+='<tr>';
                                      finalEmailBody+='<td style="color: #153643; font-family: Arial, sans-serif;">';
                                         finalEmailBody+='<h1 style="font-size: 24px; margin: 0;">Hi,</h1>';
                                      finalEmailBody+='</td>';
                                   finalEmailBody+='</tr>';
                                   finalEmailBody+='<tr>';
                                      finalEmailBody+='<td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 15px 0 20px 0;">';
                                         finalEmailBody+='<p style="margin: 0;">Below is this week Active Sprint Progress Report. View the attachment for a detailead report.</p>';
                                      finalEmailBody+='</td>';
                                   finalEmailBody+='</tr>';
                                   finalEmailBody+='<tr>';
                                      finalEmailBody+='<td>';
                                         finalEmailBody+='<table class="smarttable" width="100%" cellpadding="0" cellspacing="0" style="min-width:100%;border: 1px solid #e6e6e6;">';
                                            finalEmailBody+='<thead>';
                                               finalEmailBody+='<tr>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Project Name</th>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Sprint Name</th>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Sprint Start Date</th>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Sprint Target Date</th>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Previous Day Sprint Progress</th>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Current Sprint Progress</th>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Backlog Title</th>';
            									  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Backlog Progress</th>';
            									  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Assigned Lead</th>';
                                                  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Assigned Employee</th>';
            									  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Estimated Hours</th>';	
            									  finalEmailBody+='<th scope="col" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">Remaining Hours</th>';
                                               finalEmailBody+='</tr>';
                                            finalEmailBody+='</thead>';
                                            finalEmailBody+='<tbody>';
                                                for(Integer i=0;i<issues.size();i++){
                                                   Issue__c issue = issues.get(i);
                                                    if(math.mod(i, 2) == 0){
                                                        finalEmailBody+='<tr>';
                                                    }else{
                                                      finalEmailBody+='<tr style="background-color:#f2f2f2">';  
                                                    }
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+issue.Project__r.Name+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Sprint__r.Name+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: 8cm;">'+ issue.Sprint__r.Start_Date__c+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Sprint__r.Target_Date__c+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Sprint__r.PreviousDayCumulativeProgress__c+'%'+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Sprint__r.Cumulative_Progress__c+'%'+'</td>';  
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Title__c+'</td>';  
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Progress__c+'%'+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Assignee__r.Name+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Assigned_Employee__r.Name+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Estimated_Hours__c+'</td>';
                                                      finalEmailBody+='<td valign="top" style="padding:16px; font-family: Arial,sans-serif; font-size: 14px; line-height:15px;width: auto;">'+ issue.Remaining_Hours__c+'</td>';
                                                      finalEmailBody+='</tr>';
                                                 }
                                            finalEmailBody+='</tbody>';
                                         finalEmailBody+='</table>';
                                      finalEmailBody+='</td>';
                                   finalEmailBody+='</tr>';
                                    finalEmailBody+='<tr>';
                                        finalEmailBody+='<td style="color: #153643; font-family: Arial, sans-serif; padding: 30px 0 5px 0;">';
                                        finalEmailBody+='<p style="margin: 0;"><a href="https://agile-ytracker-developer-edition.ap24.force.com/s/report-and-dashboard">View in Application</a>.<br/></p>';    
                                        finalEmailBody+='<p style="margin: 0;font-size: 16px;"><b>Regards,</b></p>';
                                             finalEmailBody+='<p style="margin: 0;font-size: 14px;padding-left:3px;"><b>'+' Agile PTracker Team</b></p>';
                                        finalEmailBody+='</td>';
                                    finalEmailBody+='</tr>';
                                finalEmailBody+='</table>';
                             finalEmailBody+='</td>';
                          finalEmailBody+='</tr>';
                          finalEmailBody+='<tr>';
                             finalEmailBody+='<td bgcolor="#ee4c50" style="padding: 30px 30px;">';
                                finalEmailBody+='<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">';
                                   finalEmailBody+='<tr>';
                                      finalEmailBody+='<td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">';
                                         finalEmailBody+='<p style="margin: 0;">Copyright &copy; 2021. <a href="https://www.yash.com/" style="color: #ffffff;">YASH Technologies</a>.<br/>';
                                            finalEmailBody+='All Rights Reserved.';
                                         finalEmailBody+='</p>';
                                      finalEmailBody+='</td>';
                                      finalEmailBody+='<td align="right">';
                                         finalEmailBody+='<table border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">';
                                            finalEmailBody+='<tr>';
                                               finalEmailBody+='<td>';
                                                  finalEmailBody+='<a href="https://twitter.com/YASH_Tech">';
                                                  finalEmailBody+='<img src="https://assets.codepen.io/210284/tw.gif" alt="Twitter." width="38" height="38" style="display: block;" border="0" />';
                                                  finalEmailBody+='</a>';
                                               finalEmailBody+='</td>';
                                               finalEmailBody+='<td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>';
                                               finalEmailBody+='<td>';
                                                finalEmailBody+='<a href="https://www.facebook.com/YASHCorporate">';
                                                  finalEmailBody+='<img src="https://assets.codepen.io/210284/fb.gif" alt="Facebook." width="38" height="38" style="display: block;" border="0" />';
                                                  finalEmailBody+='</a>';
                                               finalEmailBody+='</td>';
                                            finalEmailBody+='</tr>';
                                         finalEmailBody+='</table>';
                                      finalEmailBody+='</td>';
                                   finalEmailBody+='</tr>';
                                finalEmailBody+='</table>';
                             finalEmailBody+='</td>';
                          finalEmailBody+='</tr>';
                       finalEmailBody+='</table>';
                    finalEmailBody+='</td>';
                 finalEmailBody+='</tr>';
              finalEmailBody+='</table>';
    	finalEmailBody+='</body></html>';
        } catch(Exception e){
            System.debug('Failed in send_email method'+e.getMessage());  
            finalEmailBody='';
        }
        return finalEmailBody;        
    }
}