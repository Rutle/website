'use strict'

var axios = require('axios');

const apiURL = 'https://api.github.com/repos/rutle/'
const suffixApiURL = '/commits?per_page=3&sha='

var config = {
  headers: {'Authorization': 'token '+process.env.PERSONAL_ACCESS_TOKEN}
  };

/**
 * This function fetches commits of a Github repo through Github API.
 * @param {String} projectRepo Name of the repository to fetch commits from.
 */
exports.getCommits =  function(projectRepo) {
  return axios.get(apiURL+projectRepo+suffixApiURL, config)
    .then(function(response) {
      let commitData = response.data;
      console.log(response);
      let returnData = [];
      commitData.forEach(function(elem, i) {
        let now = new Date();
        let commitDate = new Date(elem.commit.committer.date);
        let seconds = Math.abs(now.getTime() - commitDate.getTime()) / 1000;

        let days = Math.floor(seconds / 86400);  // 60*60*24
        seconds -= days * 86400;

        let hours = Math.floor(seconds / 3600) % 24;
        seconds -= hours * 3600;

        let minutes = Math.floor(seconds / 60) % 60;
        seconds -= minutes * 60;
        seconds = seconds % 60;

        let commitObject = {
          message: elem.commit.message,
          committer: elem.commit.committer.name,
          days: days,
          hours: hours,
          minutes: minutes 
        }
        returnData.push(commitObject);
        // Generate an event on the feed.
        //addFeedEvent(commitObject)
      })
      // Return a promise.
      return returnData;
    })
    .catch(function (error) {
      console.log(error);
      return [{isError: true, errorMessage: error}];
    });
}

