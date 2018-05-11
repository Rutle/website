'use strict'

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
function getCommits(projectRepo) {
    axios.get(apiURL+projectRepo+suffixApiURL)
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



function addFeedEvent(dataObject) {
    let feedDiv = document.getElementById('commitFeed');
    let eventDiv = document.createElement('div');
    eventDiv.className = 'event';

    let iconDiv = document.createElement('div');
    iconDiv.className = 'label';
    let gitIcon = document.createElement('i');
    gitIcon.className = 'github icon';

    iconDiv.appendChild(gitIcon);
    eventDiv.appendChild(iconDiv);

    let contentDiv = document.createElement('div');
    contentDiv.className = 'content';

    let summaryDiv = document.createElement('div');
    summaryDiv.className = 'summary';

    let linkEle = document.createElement('a');
    linkEle.appendChild(document.createTextNode(dataObject.committer));
    summaryDiv.appendChild(linkEle);
    summaryDiv.appendChild(document.createTextNode(' committed on'));

    let dateDiv = document.createElement('div');
    dateDiv.className = 'date';
    let commitDate = '';

    // The time that has passed since the commit.
    if (dataObject.days > 0 ) {
        commitDate = dataObject.days+' days ago';
    } else if (dataObject.hours > 0 ) {
        commitDate = dataObject.hours+' hours and '+dataObject.minutes+' minutes ago';
    } else if (dataObject.minutes > 0 ) {
        commitDate = dataObject.minutes+' minutes ago';
    } else {
        commitDate = 'Just now';
    }
    dateDiv.appendChild(document.createTextNode(commitDate));
    summaryDiv.appendChild(dateDiv);
    contentDiv.appendChild(summaryDiv);

    let commitMessageDiv = document.createElement('div');
    commitMessageDiv.className = 'extra text';
    commitMessageDiv.appendChild(document.createTextNode(dataObject.message));
    
    contentDiv.appendChild(commitMessageDiv);
    eventDiv.appendChild(contentDiv);
    feedDiv.appendChild(eventDiv);
}

