const csv = require('csv-parser')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs')
const axios = require('axios');
const results = [];
const appArray = [];

this.state = {
          termArray: 'asdf',
          appVendorArray: []
        }

fs.createReadStream('input/ProvisionInput.csv')
  .pipe(csv(['Name']))
  .on('data', (data) => results.push(data))
  .on('end', () => {

  var itemCount = results.length;

    for (var i = 1; i < itemCount; i++)
    {
          var appName = results[i][0]
          var appStatus = results[i][1]
          var appType = results[i][2]
          var self = this;
          var appInstalled = "No"

          appArray.push({'name': appName, 'status': appStatus, 'type': appType, 'installed': appInstalled})

    }


    const csvWriter = createCsvWriter({
        path: 'output/ProvisionOutput.csv',
        header: [
            {id: 'name', title: 'Name'},
            {id: 'status', title: 'Status'},
            {id: 'type', title: 'Type'},
            {id: 'installed', title: 'Installed'}
        ]
    });

    csvWriter.writeRecords(appArray)      // returns a promise
        .then(() => {
            console.log('...Done');
        });



  });
