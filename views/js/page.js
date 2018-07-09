$(function () {
    'use strict'

    //$('.ui.dropdown').dropdown({ on: 'hover' }); // Initialize dropdown menu.
    $('#dashboard_menu > a.item').each(function (idx, element) {
        $(this).tab();
    });

    $('#lesser_menu > .ui.container > a.item').click(function () {
        $('.ui.labeled.icon.sidebar').sidebar('toggle');
    });
    /*
    $('#full_menu > .ui.container > .ui.dropdown.item').click(function () {
        //console.log('dropdown click')
        $(this).dropdown();
    })*/

    $('#commit_header > i').click(function () {
        console.log("minimize click");
        minimizeFeed();

    });
    $('#commit_header > i').hover(function () {
        $(this).addClass('inverted')
    }, function () {
        $(this).removeClass('inverted')
    });

    $('#admin_popup').popup({
        content: 'Admin controls.',
        position: 'bottom right'
    }); // Initialize popup for admin icon.

    $('#dashboard_menu > a.item').click(function () {
        $(this).tab();

    });

    $('.ui.fluid.card').hover(function () {
        console.log("hover in");
        //feedDiv.style.height = feedDiv.scrollHeight + "px";
        let height = $(this).height() + "px";
        $(this).children('#content_hide').css("height", height)
        $(this).children('#content_hide').css("padding-top", "7px");
        $(this).children('#content_hide').css("padding-bottom", "7px");

    }, function () {
        console.log("hover out")
        $(this).children('#content_hide').css("height", "0");
        $(this).children('#content_hide').css("padding-top", "0");
        $(this).children('#content_hide').css("padding-bottom", "0");

    });

    $('#category_dpn').dropdown();
    
    /**
     * Project list dropdown in the main top bar.
     */
    $('#project_dd')
        .dropdown({
            apiSettings: {
                url: '/api/projects'
            },
            action: 'hide',
            onChange: function (value, text, $selectedItem) {
                console.log("Text: ", text);
                console.log("Value: ", value);
                console.log($selectedItem)
                window.location = value;
            },
            saveRemoteData: false,
            direction: 'auto'
        });

    /**
     * Function to add error messages to a form's error message box and input/dropdown fields.
     * @param {Array} messages Contains objects {name, value} where name is the id of the error causing field and value is the error message.
     * @param {String} divId Id of the error message div.
     * @param {String} type Type of the input: Dropdown etc.
     */
    function addErrorMessages(messages, divId, type) {
        let eMessageDiv = document.getElementById(divId);
        while (eMessageDiv.firstChild) {
            eMessageDiv.removeChild(eMessageDiv.firstChild);
        }
        let list = document.createElement('ul');
        list.className = 'list';
        messages.forEach(function (elem, idx) {
            let listItem = document.createElement('li');
            listItem.appendChild(document.createTextNode(elem.value));
            list.appendChild(listItem);
            addErrorInfo(elem.name, type);
        });
        eMessageDiv.appendChild(list);
        eMessageDiv.style.display = 'inherit';
    }

    /**
     * Function to add error messages to a form's input field.
     * @param {String} id Id of the input field.
     * @param {String} messageBoxId Id of the form's error message box.
     */
    function addErrorInfo(id, type) {
        let inputNode = document.getElementById(id);
        inputNode.style.color = '#9f3a38';
        inputNode.style.borderColor = '#e0b4b4';
        inputNode.style.backgroundColor = '#fff6f6';
        let label = '';
        if (type === 'input') {
            label = document.getElementById(id).previousElementSibling;
        } else if (type === 'dropdown') {
            label = inputNode.previousElementSibling
        }
        label.style.color = '#9f3a38';
    }

    /**
     * Function to clear error messages from a form.
     * @param {String} id Id of the input field.
     * @param {String} messageBoxId Id of the form's error message box.
     */
    function clearErrorInfo(id, messageBoxId) {
        let inputNode = document.getElementById(id);
        inputNode.style.color = 'rgba(0,0,0,.95)';
        inputNode.style.borderColor = '#85b7d9';
        inputNode.style.backgroundColor = '#fff';
        let label = inputNode.previousElementSibling;
        label.style.color = 'rgba(0,0,0,.87)';
        let eMessageDiv = document.getElementById(messageBoxId);
        while (eMessageDiv.firstChild) {
            eMessageDiv.removeChild(eMessageDiv.firstChild);
        }
        eMessageDiv.style.display = 'none';
    }


    /**
     * Remove projects from database through the dashboard page 'current projects'.
     */
    $('div.content > a.ui.top.right.attached.label').click(function (event) {
        let id = $(this).parent().parent().attr('id');
        console.log(id);
        let isRemoved = false;

        $('#modal_premove > div.actions > button.ui.ok.button').val(id);
        $('#modal_premove')
            .modal({
                transition: 'slide down',
                //inverted: true,
                centered: false,
                onApprove: function ($element) {
                    console.log("approve: ", $element.val())
                    $.ajax({
                        method: 'POST',
                        url: '/dashboard/projects',
                        data: { shortName: $element.val() },
                        success: function (data) {
                            if (data.success) {
                                console.log(data.message);
                                isRemoved = true;
                                return true;
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                        }
                    });
                },
                onHidden: function () {
                    if (isRemoved) {
                        $('div#' + id + '.card')
                            .transition({
                                animation: 'slide right',
                                duration: '0.5s',
                                onComplete: function () {
                                    $('div#' + id + '.card').remove();
                                }

                            });
                    }
                }
            })
            .modal('show')
    });

    /**
     * Form configuration for adding new project.
     */
    $('#project_form')
        .form({
            on: 'blur',
            fields: {
                project_name: {
                    identifier: 'project_name',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter project name.'
                        }
                    ]
                },
                short_name: {
                    identifier: 'short_name',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter short name.'
                        }
                    ]
                },
                short_desc: {
                    identifier: 'short_desc',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please write a short description for the project'
                        }
                    ]
                }
            },
            debug: true,
            onSuccess: function (event, fields) {

                event.preventDefault();
                $('.ui.form').addClass('loading');

                console.log('checkbox', $("input:checkbox").is(":checked") ? 1 : 0)
                $.ajax({
                    method: 'POST',
                    url: '/dashboard/new',
                    data: {
                        form: JSON.parse(JSON.stringify($('#project_form').serializeArray())),
                        websiteProject: $("input:checkbox").is(":checked") ? 1 : 0
                    },
                    dataType: 'json',
                    success: function (data) {
                        console.log("vastaus: ", data.message);
                        $('.ui.form').removeClass('loading');
                        $('.ui.form').form('clear');
                        let eMessageDiv = document.getElementById('error_messages');
                        eMessageDiv.style.display = 'none';
                        let sMessageDiv = document.getElementById('success_messages');

                        let header = document.createElement('div');
                        header.className = 'header';
                        header.appendChild(document.createTextNode(data.message));
                        sMessageDiv.appendChild(header);
                        sMessageDiv.style.display = 'flex';


                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let error = errorThrown;
                        let customErrorMessages = JSON.parse(jqXHR.responseText);
                        console.log("responseText: ", customErrorMessages);

                        let eMessageDiv = document.getElementById('error_messages');
                        while (eMessageDiv.firstChild) {
                            eMessageDiv.removeChild(eMessageDiv.firstChild);
                        }
                        let list = document.createElement('ul');
                        list.className = 'list';
                        customErrorMessages.forEach(function (elem, idx) {
                            let listItem = document.createElement('li');
                            listItem.appendChild(document.createTextNode(elem));
                            list.appendChild(listItem);
                        });
                        eMessageDiv.appendChild(list);
                        eMessageDiv.style.display = 'inherit';
                        $('.ui.form').removeClass('loading');

                    }
                });
                //}


            },
            onFailure: function (formErrors, fields) {
                console.log(formErrors);
                console.log(fields);
                let eMessageDiv = document.getElementById('error_messages');
                while (eMessageDiv.firstChild) {
                    eMessageDiv.removeChild(eMessageDiv.firstChild);
                }
                let list = document.createElement('ul');
                list.className = 'list';
                formErrors.forEach(function (elem, idx) {
                    let listItem = document.createElement('li');
                    listItem.appendChild(document.createTextNode(elem));
                    list.appendChild(listItem);
                });
                eMessageDiv.appendChild(list);
                eMessageDiv.style.display = 'flex';
                return false;
            }
        });

    $('#project_form_clear').click(function (event) {
        console.log("clear");
        event.preventDefault();
        document.getElementById("project_form").reset();
        let sMessageDiv = document.getElementById('success_messages');
        let eMessageDiv = document.getElementById('error_messages');
        while (eMessageDiv.firstChild) {
            eMessageDiv.removeChild(eMessageDiv.firstChild);
        }
        while (sMessageDiv.firstChild) {
            sMessageDiv.removeChild(sMessageDiv.firstChild);
        }
        eMessageDiv.style.display = 'none';
        sMessageDiv.style.display = 'none';
    });

});
