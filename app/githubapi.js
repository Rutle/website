'use strict'

var axios = require('axios');

const apiURL = 'https://api.github.com/repos/rutle/'
const suffixApiURL = '/commits?per_page=3&sha='

var config = {
    headers: { 'Authorization': 'token ' + process.env.PERSONAL_ACCESS_TOKEN }
};

/**
 * Enum for actions.
 * @readonly
 * @enum {String}
 */
const gitHubAction = {
    GETDESCRIPTION: 'getDescription',
    GETREPOSITORY: 'getRepository',
    INVALIDACTION: 'Invalid action'
};
/**
 * This function fetches commits of a Github repo through Github API.
 * @param {String} projectRepo Name of the repository to fetch commits from.
 */
function getCommits(projectRepo) {
    return axios.get(apiURL + projectRepo + suffixApiURL, config)
        .then(function (response) {
            let commitData = response.data;
            console.log(response);
            let returnData = [];
            commitData.forEach(function (elem, i) {
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
            return [{ isError: true, errorMessage: error }];
        });
}

/**
 * Function to fetch repository data.
 * @param {String} repo Name of the Github repository.
 * @param {Enum} action What is fetched.
 */
function getRepository(repo, action) {
    switch (action) {
        case gitHubAction.GETREPOSITORY:
            return axios.get('https://api.github.com/repos/rutle/' + repo + '/commits?per_page=3&sha=master')
                .then(function (response) {
                    if (response.status === 200) {
                        const json = response.data;
                        const headers = response.headers;
                        console.log("eka: ", json);
                        /*
                        fs.writeFile('apitest.json',
                            JSON.stringify(json, null, 4),
                            (err) => console.log('File successfully written!'));
                        */
                        return json;
                    }

                }, function (err) {
                    console.log("Repository fetching error [GETREPOSITORY]: ", err);
                });
            break;
        case gitHubAction.GETDESCRIPTION:
            return axios.get('https://api.github.com/repos/rutle/' + repo + '/readme',
                { headers: { Accept: 'application/vnd.github.VERSION.raw' } })
                .then(function (response) {
                    if (response.status === 200) {
                        const json = response.data;
                        //const headers = reponse.headers;
                        //console.log("readme: ", response)
                        //let descData = json['content'];
                        /*
                        json.forEach((elem, idx) => {
                            descData.push({ repo: elem.name, description: elem.desciption })
                        })*/

                        //console.log("repos data: ", json);
                        return json;
                    }
                }, function (err) {
                    console.log("Description fetching error [GETDESCRIPTIONS]: ", err);
                })
            break;
        default:
            return gitHubAction.INVALIDACTION;
            break;
    }

}

module.exports = {
    gitHubAction: gitHubAction,
    getRepository: getRepository,
    getCommits: getCommits
};