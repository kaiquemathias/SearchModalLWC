public with sharing class SearchModalController {
    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String searchString, String objectApiName, List<String> columns, String whereClause, Integer maxRecords){
        
        String fields = getColumnsAsString(columns);

        searchString = String.escapeSingleQuotes(searchString);
        objectApiName = String.escapeSingleQuotes(objectApiName);
        
        if(whereClause == null){
            whereClause = '';
        }
        
        String query = 'SELECT Id, '+fields+' FROM '+objectApiName+' WHERE '+whereClause+' LIMIT '+maxRecords;
        System.debug('query ==> ' + query);

        List<SObject> lstRecords = Database.query(query);
        
        return lstRecords;
    }

    public static String getColumnsAsString(List<String> columns) {
        String fields = '';
        for(String column : columns) {
            fields += column + ',';
        }
        fields = fields.removeEnd(',');
        return fields;
    }
}