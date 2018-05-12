'use strict'
var axios = require('axios');

const apiURL = 'https://api.github.com/repos/rutle/'
const suffixApiURL = '/commits?per_page=3&sha='

/* Template of a commit feed event.
<div class="event">
    <div class="label">
        <i class="github icon"></i>
    </div>
    <div class="content">
        <div class="summary">
            <a>Joe Henderson</a> posted on his page
            <div class="date">
            3 days ago
            </div>
        </div>
        <div class="extra text">
            Ours is a life of constant reruns. We're always circling back to where we'd we started, then starting all over again. Even if we don't run extra laps that day, we surely will come back for more of the same another day soon.
        </div>
    </div>
</div>
*/

/**
 * This function fetches commits of a Github repo through Github API.
 * @param {String} projectRepo Name of the repository to fetch commits from.
 */
exports.getCommits =  function(projectRepo) {
    return axios.get(apiURL+projectRepo+suffixApiURL)
         .then(function(response) {
            let commitData = response.data;
            console.log(response);
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
                // Generate an event on the feed.
                addFeedEvent(commitObject)
            })
         })
         .catch(function (error) {
            console.log(error);
        });
}

