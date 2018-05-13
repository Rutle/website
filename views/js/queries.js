/**
 * buildFeed function asks server to fetch data from 'repo' repository.
 * @param {String} repo Repository's name.
 */
function buildFeed(repo) {
    // Ajax post call to make server side fetch the tweet data for current user.
    $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/projects/' + repo,
        //url: 'https://ohsiha-webmc.herokuapp.com/dashboard',
        dataType: 'json',
        success: function (data) {
            data.data.forEach(function (elem, i) {
                addFeedEvent(elem);
            });

        },
        error: function (jqXHR, textStatus, err) {
            alert(jqXHR.responseText);
        }
    });
}

/**
 * addFeedEvent function adds an event to the div with id 'commitFeed'
 * @param {Object} dataObject Object containing necessary data to add an event
 */
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
    if (dataObject.days > 0) {
        commitDate = dataObject.days + ' days ago';
    } else if (dataObject.hours > 0) {
        commitDate = dataObject.hours + ' hours and ' + dataObject.minutes + ' minutes ago';
    } else if (dataObject.minutes > 0) {
        commitDate = dataObject.minutes + ' minutes ago';
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