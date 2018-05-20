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
        error: function (jqXHR, textStatus, err, data) {
            alert(data.errorMessage);
        }
    });
}

/**
 * addFeedEvent function adds an event to the div with id 'commitFeed'
 * @param {Object} dataObject Object containing necessary data to add an event
 */
function addFeedEvent(dataObject) {
    let feedDiv = document.getElementById('commit_feed');
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

function minimizeFeed() {
    var feedDiv = document.getElementById('commit_feed');
    var minIcon = document.getElementById('minimize_icon');
    if (feedDiv.clientHeight) {
      feedDiv.style.height = 0;
      minIcon.className = 'angle down icon'
    } else {
      feedDiv.style.height = feedDiv.scrollHeight + "px";
      minIcon.className = 'angle up icon';
    }
    // document.getElementById("more-button").value=document.getElementById("more-button").value=='Read more'?'Read less':'Read more';
}

function minimizeCard() {
    let contentDiv = document.getElementById('')
}


/*
        <div id="form_section_container">
            <div class="fields">
                <div class="five wide field">
                    <div class="fields">
                        <div class="sixteen wide field">
                            <label>Section name</label>
                            <input name="first-name" placeholder="First Name" type="text">
                        </div>
                    </div>
                    <div class="fields">
                        <div class="sixteen wide field">
                            <button class="ui basic button">Remove this section</button>
                        </div>
                    </div>
                </div>
                <div class="eleven wide field">
                    <label>Text</label>
                    <textarea placeholder="Paragraph for a section."></textarea>
                </div>
            </div>
        </div>
*/




function addFormSection() {

    let feedDiv = document.getElementById('form_section_container');
    let fieldsDiv = document.createElement('div');
    fieldsDiv.className = 'fields';

    let fieldDiv = document.createElement('div');
    fieldDiv.className = 'five wide field';

    let sectionFieldsDiv = document.createElement('div');
    innerFieldsDiv.className = 'fields';
    let sectionNameFieldDiv = document.createElement('div');
    sectionNameFieldDiv.className = 'sixteen wide field';
    let labelName = document.createElement('label');
    labelName.appendChild(document.createTextNode('Section name'));
    sectionNameFieldDiv.appendChild(labelName);

    let inputName = document.createElement('input');
    inputName.setAttribute('name', 'section_name');
    inputName.setAttribute('placeholder', 'e.g. Description');
    inputName.setAttribute('type', 'text');
    sectionNameFieldDiv.appendChild(inputName);
    innerFieldsDiv.appendChild(sectionNameFieldDiv);
    



    let buttonFieldsDiv = document.createElement('div');
    buttonFieldsDiv.className = 'fields';

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