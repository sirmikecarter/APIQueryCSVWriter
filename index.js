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
          appArray.push({'name': results[i][0],'description': results[i][1], 'status': results[i][2], 'statusdate': results[i][3], 'type': results[i][4], 'installedname': '', 'rawid': '', 'spendingplanid': '' })
    }

    getInstalledData()

    //////
    async function getInstalledData(){

        var appCount = appArray.length;

          for (var i = 0; i < appCount; i++)
          {

            await new Promise((resolve, reject) => setTimeout(resolve, 1000));

            await client.search('x', {search: appArray[i].description, top: 10}, function(err, searchResults){

              var resultText = ''

                if(searchResults.length > 0){

                  for (var y = 0; y < searchResults.length; y++)
                  {
                    if(searchResults[y]['@search.score'] >= .95){
                      resultText += searchResults[y].questions[0] + ', '
                    }
                  }

                  if(resultText != ''){
                    Installed(i-1, appArray[i-1].name, resultText)
                  }else{
                    Installed(i-1, appArray[i-1].name, "Not Found")
                  }

                }else{
                  Installed(i-1, appArray[i-1].name, "Not Found")
                }

            });

          }
          getRAWData()
    }

    //////
    async function getRAWData(){

        var appCount = appArray.length;

          for (var i = 0; i < appCount; i++)
          {

            await new Promise((resolve, reject) => setTimeout(resolve, 1000));

            await client.search('x', {search: appArray[i].description, top: 25}, function(err, searchResults){

              var resultText = ''

                if(searchResults.length > 0){

                  for (var y = 0; y < searchResults.length; y++)
                  {
                    if(searchResults[y]['@search.score'] >= .95){
                      resultText += searchResults[y].metadata_rawid + ', '
                    }
                  }

                  if(resultText != ''){
                    RAW(i-1, appArray[i-1].name, resultText)
                  }else{
                    RAW(i-1, appArray[i-1].name, "Not Found")
                  }

                }else{
                  RAW(i-1, appArray[i-1].name, "Not Found")
                }

            });

          }
          getSpendingPlanData()
        }

        //////
        async function getSpendingPlanData(){

            var appCount = appArray.length;

              for (var i = 0; i < appCount; i++)
              {

                await new Promise((resolve, reject) => setTimeout(resolve, 1000));

                await client.search('x', {search: appArray[i].description, top: 25}, function(err, searchResults){

                  var resultText = ''

                    if(searchResults.length > 0){

                      for (var y = 0; y < searchResults.length; y++)
                      {
                        if(searchResults[y]['@search.score'] >= .40){
                          resultText += searchResults[y].metadata_year + '(' + searchResults[y].metadata_itemid + ')' + ', '
                        }
                      }

                      if(resultText != ''){
                        SpendingPlan(i-1, appArray[i-1].name, resultText)
                      }else{
                        SpendingPlan(i-1, appArray[i-1].name, "Not Found")
                      }

                    }else{
                      SpendingPlan(i-1, appArray[i-1].name, "Not Found")
                    }

                });

              }

        //////
        await new Promise((resolve, reject) => setTimeout(resolve, 1000));

        const csvWriter = createCsvWriter({
              path: 'output/ProvisionOutput.csv',
              header: [
                  {id: 'name', title: 'Name'},
                  {id: 'description', title: 'Description'},
                  {id: 'status', title: 'Status'},
                  {id: 'statusdate', title: 'Status Date'},
                  {id: 'type', title: 'Type'},
                  {id: 'installedname', title: 'Installed Name'},
                  {id: 'rawid', title: 'RAW ID'},
                  {id: 'spendingplanid', title: 'Spending Plan ID'}
              ]
          });

        csvWriter.writeRecords(appArray)
              .then(() => {
                  console.log('...Done');
              });
    }

    //////
    function Installed(num, appName, installedName){
      console.log("num: " + num)
      console.log("App Name: " + appName)
      console.log("Installed Name: " + installedName)

      appArray[num].installedname = installedName
    }

    function RAW(num, appName, rawId){
      console.log("num: " + num)
      console.log("App Name: " + appName)
      console.log("raw Id: " + rawId)

      appArray[num].rawid = rawId
    }

    function SpendingPlan(num, appName, spendingPlanId){
      console.log("num: " + num)
      console.log("App Name: " + appName)
      console.log("Spending Plan Id: " + spendingPlanId)

      appArray[num].spendingplanid = spendingPlanId
    }

});
