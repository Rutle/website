
$(function () {
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
    })

    $('#admin_popup').popup({
        content: 'Admin controls.',
        position: 'bottom right'
    }) // Initialize popup for admin icon.

    $('#dashboard_menu > a.item').click(function () {
        $(this).tab();

    })

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

    })
    /*
    $('.ext_top_row, .ext_middle_row, .ext_bottom_row').hover(function () {
        console.log("hover in");
        //feedDiv.style.height = feedDiv.scrollHeight + "px";
        let height = $(this).height() + "px";
        $(this).children('#content_hide').css("height", height)

    }, function () {
        console.log("hover out")
        $(this).children('#content_hide').css("height", "0");

    })*/
    $('.ext_top_row, .ext_middle_row, .ext_bottom_row').click(function () {
        if (!$(this).children('#content_hide').height()) {
            let height = $(this).height() + "px";
            $(this).children('#content_hide').css("height", height)
            $(this).children('.ext_cat').children('i').removeClass().addClass('caret square up outline icon');
        } else {
            $(this).children('#content_hide').css("height", "0");
            $(this).children('.ext_cat').children('i').removeClass().addClass('caret square down outline icon')
        }

    })
    $('#cat_dpn')
        .dropdown({
            apiSettings: {
                url: 'http://localhost:5000/api/stores/'
            },
            filterRemoteData: false,

            saveRemoteData: false,
            fullTextSearch: 'exact',
            direction: 'auto',
            debug: true
        })
    /**
     * Project list dropdown.
     */
    $('#project_dd')
        .dropdown({
            apiSettings: {
                url: 'http://localhost:5000/api/projects'
            },
            action: 'hide',
            onChange: function (value, text, $selectedItem) {
                console.log("Text: ", text);
                console.log("Value: ", value);
                console.log($selectedItem)
                window.location = value;
            },
            filterRemoteData: false,
            saveRemoteData: false,
            direction: 'auto',
            debug: true
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
                }
            }
            ,
            onSuccess: function (event, fields) {
                event.preventDefault();
                $('.ui.form').addClass('loading');
                $.ajax({
                    method: 'POST',
                    url: '/dashboard/new',
                    data: {
                        form: JSON.parse(JSON.stringify($('#project_form').serializeArray())),
                        websiteProject: $("input:checkbox").is(":checked") ? 1 : 0
                    },
                    dataType: 'json',
                    success: function (data) {
                        //console.log("vastaus: ", data);
                        $('.ui.form').removeClass('loading');
                    },
                    error: function (jqXHR, textStatus, errorThrown, data) {
                    }
                });
            },
            onFailure: function (formErrors, fields) {
                //console.log(formErrors);
                //console.log(fields);
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
    /*
$('#testbtn').click(function (event) {
    if ($('#project_form').form('is valid')) {
        // form is valid (both email and name)
        console.log("valid");
        $('.ui.form').addClass('loading');
        $.ajax({
            type: 'POST',
            url: '/dashboard/new',
            data: { form: JSON.parse(JSON.stringify($('#project_form').serializeArray())) },
            dataType: 'json',
            success: function (data) {
                console.log("vastaus: ", data);
                $('.ui.form').removeClass('loading');
            },
            error: function (jqXHR, textStatus, errorThrown, data) {
            }
        });
    }
});*/
});
