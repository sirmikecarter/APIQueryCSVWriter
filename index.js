const csv = require('csv-parser')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs')
const results = [];
const appArray = [];

var AzureSearch = require('azure-search');
var client = AzureSearch({
  url: "x",
  key: "x",
  version: "2016-09-01", // optional, can be used to enable preview apis
  headers: { // optional, for example to enable searchId in telemetry in logs
    "x-ms-azs-return-searchid": "true",
    "Access-Control-Expose-Headers": "x-ms-azs-searchid"

  }
});

fs.createReadStream('input/ProvisionInput.csv')
  .pipe(csv(['Name']))
  .on('data', (data) => results.push(data))
  .on('end', () => {

  var itemCount = results.length;

    for (var i = 1; i < itemCount; i++)
    {
          appArray.push({'name': results[i][0], 'status': results[i][1], 'type': results[i][2], 'installed': 'installed', 'servicerequest': 'servicerequest' })
    }

    getInstalledData()

    //////

    async function getInstalledData(){

        var appCount = appArray.length;

          for (var i = 0; i < appCount; i++)
          {

            await new Promise((resolve, reject) => setTimeout(resolve, 1000));

            await client.search('x', {search: appArray[i].name, top: 1}, function(err, searchResults){

                if(searchResults.length > 0){
                  installed(i-1, appArray[i-1].name, searchResults[0].questions[0])
                }else{
                  installed(i-1, appArray[i-1].name, "Not Installed")
                }

            });

          }
          getServiceRequestData()
    }

    //////

    async function getServiceRequestData(){

        var appCount = appArray.length;

          for (var i = 0; i < appCount; i++)
          {

            await new Promise((resolve, reject) => setTimeout(resolve, 1000));

            await client.search('x', {search: appArray[i].name, top: 1}, function(err, searchResults){

                if(searchResults.length > 0){
                  ServiceRequest(i-1, appArray[i-1].name, searchResults[0].metadata_rawid)
                }else{
                  appServiceRequest = "No"
                  ServiceRequest(i-1, appArray[i-1].name, "No RAW")
                }

            });


          }

        //////

        await new Promise((resolve, reject) => setTimeout(resolve, 1000));

        const csvWriter = createCsvWriter({
              path: 'output/ProvisionOutput.csv',
              header: [
                  {id: 'name', title: 'Name'},
                  {id: 'status', title: 'Status'},
                  {id: 'type', title: 'Type'},
                  {id: 'installed', title: 'Installed'},
                  {id: 'servicerequest', title: 'Service Request'}
              ]
          });

        csvWriter.writeRecords(appArray)
              .then(() => {
                  console.log('...Done');
              });
    }


    //////

    function installed(num, appName, flexeraName){
      console.log("num: " + num)
      console.log("appName: " + appName)
      console.log("flexeraName: " + flexeraName)

      appArray[num].installed = flexeraName

    }

    function ServiceRequest(num, appName, rawId){
      console.log("num: " + num)
      console.log("appName: " + appName)
      console.log("rawId: " + rawId)

      appArray[num].servicerequest = rawId

    }

});
