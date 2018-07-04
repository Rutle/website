
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
    $('#category_dpn').dropdown();
    /**
     * 
     */
    $('#store_dpn')
        .dropdown({
            apiSettings: {
                url: 'http://localhost:5000/api/stores/',
                onComplete: function (response) {
                    //console.log(response);
                    //response.results[0].selected = true;
                    //console.log(response);
                }
            },
            onChange: function (value, text, $choice) {
                /*
                $.ajax({
                    method: 'GET',
                    url: '/api/stores/' + value,
                    dataType: 'json',
                    success: function (data) {
                        console.log('message: ', data.message);

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                        let customErrorMessages = JSON.parse(jqXHR.responseText);
                        console.log("Given error response: ", customErrorMessages);
                    }
                });
                */
                let storeData = JSON.parse((sessionStorage.getItem('salesData')));
                storeData = (text === 'All stores' ? storeData : storeData.filter(elem => elem.storeName === text));
                let categories = JSON.parse((sessionStorage.getItem('storeCategories')));
                $('#category_dpn').dropdown({
                    values: categories[text],
                    onChange: function (value, categoryText, $choice) {
                        let storeText = $('#store_dpn').dropdown('get text');
        
                        console.log("storeText ", storeText);
                        let storeData = JSON.parse((sessionStorage.getItem('salesData')));
                        storeData = (storeText === 'All stores' ? storeData : storeData.filter(elem => elem.storeName === text));
                        console.log(storeText, categoryText);
                        populateTable(storeData, categoryText)
                    }
                 });
                populateTable(storeData);

            },
            filterRemoteData: false,
            saveRemoteData: false,
            fullTextSearch: 'exact',
            direction: 'auto',
            debug: true
        });

    /**
     * Function to populate the sales table.
     * @param {Array} storeData Data from sessionStorage for the selected store.
     * @param {String} category Selected category. Default is 'all'.
     */
    function populateTable(storeData, category = 'all') {
        let table = document.getElementById('sales_table').getElementsByTagName('tbody')[0];
        console.log(storeData);
        // Clear the table from previous data.
        for (let i = table.rows.length - 1; i >= 0; --i) {
            table.rows[i].remove();
        }
        console.log("generated new table")
        // Add new data to the table.
        let tableIdx = 0;
        storeData.forEach(function (elem, idx) {
            if (category === 'all') {
                let row = table.insertRow(tableIdx);
                let nameCell = row.insertCell(0);
                let catCell = row.insertCell(1);
                let saleCell = row.insertCell(2);
                let normCell = row.insertCell(3);
                //let storeCell = row.insertCell(4);
                nameCell.innerHTML = elem.name;
                catCell.innerHTML = elem.category;
                saleCell.innerHTML = elem.latestSalePrice;
                normCell.innerHTML = elem.latestNormalPrice == undefined ? 'N/A' : elem.latestNormalPrice;
                //storeCell.innerHTML = elem.storeName;
                tableIdx++;
            } else if (category === elem.category) {
                let row = table.insertRow(tableIdx);
                let nameCell = row.insertCell(0);
                let catCell = row.insertCell(1);
                let saleCell = row.insertCell(2);
                let normCell = row.insertCell(3);
                nameCell.innerHTML = elem.name;
                catCell.innerHTML = elem.category;
                saleCell.innerHTML = elem.latestSalePrice;
                normCell.innerHTML = elem.latestNormalPrice == undefined ? 'N/A' : elem.latestNormalPrice;
                tableIdx++;
            }
        })

    }
    $('#store_keywords')
        .dropdown({
            apiSettings: {
                url: 'http://localhost:5000/api/storekeywords/'
            },
            onChange: function (value, text, $selectedItem) {
                //console.log("Selected: ", value);
                $('#sale_keywords').dropdown({
                    apiSettings: {
                        url: 'http://localhost:5000/api/storekeywords/' + value
                    },
                    debug: false
                });

            },
            saveRemoteData: false,
            fullTextSearch: 'exact',
            direction: 'auto'
        })
    /**
      * Event handling for adding new keyword.
     */
    $('#add_keyword').click(function (event) {
        event.preventDefault();
        clearErrorInfo('store_keywords', 'store_keyword_error_messages');
        clearErrorInfo('sale_keywords', 'store_keyword_error_messages');
        clearErrorInfo('keyword', 'store_keyword_error_messages')
        let inputKeyword = document.getElementById('keyword');

        // Basic 'validation' to see if a store has been selected and keyword typed.
        if ($('#store_keywords').dropdown('get value') === '') {
            addErrorMessages([{ name: 'store_keywords', value: 'Please select a store first.' }], 'store_keyword_error_messages', 'dropdown');
        } else if (inputKeyword.value === '') {
            addErrorMessages([{ name: 'keyword', value: 'Please type a keyword.' }], 'store_keyword_error_messages', 'dropdown');
        } else {
            $('#modify_store_keywords_form').addClass('loading');
            $.ajax({
                type: 'POST',
                url: '/dashboard/scraper/addkeyword',
                data: {
                    storeId: $('#store_keywords').dropdown('get value'),
                    keyword: $('#sale_keywords').dropdown('get text')
                },
                dataType: 'json',
                success: function (data) {
                    $('#modify_store_keywords_form').removeClass('loading');

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#modify_store_keywords_form').removeClass('loading');
                    let customErrorMessages = JSON.parse(jqXHR.responseText);
                    console.log("Given error response: ", customErrorMessages);
                }
            });
        }
    })
    /**
      * Event handling for removing new keyword.
     */
    $('#remove_keyword').click(function (event) {
        event.preventDefault();
        clearErrorInfo('store_keywords', 'store_keyword_error_messages');
        clearErrorInfo('sale_keywords', 'store_keyword_error_messages');
        // Basic 'validation' to see if a store and keyword has been selected.
        if ($('#store_keywords').dropdown('get value') === '') {
            addErrorMessages([{ name: 'store_keywords', value: 'Please select a store first.' }], 'store_keyword_error_messages', 'dropdown');
        } else if ($('#sale_keywords').dropdown('get value') === '') {
            addErrorMessages([{ name: 'sale_keywords', value: 'Please select a keyword first.' }], 'store_keyword_error_messages', 'dropdown');
        } else {
            $('#modify_store_keywords_form').addClass('loading');
            $.ajax({
                type: 'POST',
                url: '/dashboard/scraper/removekeyword',
                data: {
                    storeId: $('#store_keywords').dropdown('get value'),
                    keyword: $('#sale_keywords').dropdown('get text')
                },
                dataType: 'json',
                success: function (data) {
                    $('#modify_store_keywords_form').removeClass('loading');

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    $('#modify_store_keywords_form').removeClass('loading');
                    let customErrorMessages = JSON.parse(jqXHR.responseText);
                    console.log("Given error response: ", customErrorMessages);
                }
            });
        }

    })
    /**
     * Project list dropdown.
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
     * Function to add error messages to a form.
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
            label = document.getElementById(id).previousSibling;
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
    $('#new_store_form')
        .form({
            on: 'blur',
            fields: {
                store_name: 'empty',
                store_url: ['empty', 'url']
            },
            debug: true,
            onSuccess: function (event, fields) {
                event.preventDefault();
                $('#new_store_form').addClass('loading');
                $.ajax({
                    method: 'POST',
                    url: '/dashboard/newstore',
                    data: {
                        form: JSON.parse(JSON.stringify($('#new_store_form').serializeArray())),
                    },
                    dataType: 'json',
                    success: function (data) {
                        //console.log("vastaus: ", data.message);
                        $('#new_store_form').removeClass('loading');
                        //$('.ui.form').form('clear');
                        let eMessageDiv = document.getElementById('store_error_messages');
                        eMessageDiv.style.display = 'none';
                        let sMessageDiv = document.getElementById('store_success_messages');
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

                        let eMessageDiv = document.getElementById('store_error_messages');
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
                        $('#new_store_form').removeClass('loading');

                    }
                });
            }
        });


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


    })
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
                /*,
                section_name: {
                    identifier: 'section_name',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please enter section name.'
                        }
                    ]

                },
                section_text: {
                    identifier: 'section_text',
                    rules: [
                        {
                            type: 'empty',
                            prompt: 'Please write text for section.'
                        }
                    ]
                },*/

            },
            debug: true,
            onSuccess: function (event, fields) {
                //console.log(fields);
                event.preventDefault();
                $('.ui.form').addClass('loading');
                //let isWebProject = $("input:checkbox").is(":checked") ? 1 : 0;
                let errorMessages = [];
                let formData = $('#project_form').serializeArray();
                console.log(formData);
                /*
                for (var i = (3 + parseInt(isWebProject)); i < formData.length; i += 2) {
                    let sectionName = formData[i];
                    let sectionText = formData[i + 1];
                    console.log(sectionName);
                    console.log(sectionText);
                    if (sectionName.value === '') {
                        errorMessages.push({ name: sectionName.name, value: 'Please write name for section ' + sectionName.name.slice(-1) + '.' })
                    }
                    if (sectionText.value === '') {
                        errorMessages.push({ name: sectionText.name, value: 'Please write name for section ' + sectionText.name.slice(-1) + '.' })
                    }
                }
                if (errorMessages.length > 0) {
                    
                    addErrorMessages(errorMessages, 'error_messages', 'input');

                    $('.ui.form').removeClass('loading');
                } else {*/
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

    $('#refresh_sales_data').click(function (event) {
        event.preventDefault();
        $.ajax({
            method: 'GET',
            url: '/api/scraper/salesdata',
            dataType: 'json',
            success: function (data) {
                console.log(data);
                let table = document.getElementById('store_data');
                for (let i = table.rows.length - 2; i > 0; i--) {
                    table.deleteRow(i);
                }
                data.data.forEach(function (elem, idx) {
                    let row = table.insertRow(idx + 1);
                    let nameCell = row.insertCell(0);
                    let countCell = row.insertCell(1);
                    let dateCell = row.insertCell(2);
                    nameCell.innerHTML = elem.storeName;
                    countCell.innerHTML = elem.count;
                    countCell.setAttribute('id', elem.storeName + '_count');
                    dateCell.innerHTML = 'Today'
                })



            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    });
    $('#update_sales_data').click(function (event) {
        event.preventDefault();
        $('#update_sales_data').addClass('loading');

        $.ajax({
            type: 'POST',
            url: '/dashboard/scraper/update',
            data: { action: 'update' },
            dataType: 'json',
            success: function (data) {
                console.log("Data retrieved: ", data);
                let table = document.getElementById('store_data');
                data.newInsertByStore.forEach(function (elem, idx) {
                    console.log(typeof (elem.count));
                    if (elem.count > 0) {
                        let cell = document.getElementById(elem.storeName + '_count');
                        cell.innerHTML = cell.innerHTML + ' (+' + elem.count + ')';
                        cell.className = 'positive';
                    }
                })
                $('#update_sales_data').removeClass('loading');

            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    });
    $('#add_new_section').click(function (event) {
        event.preventDefault();
        addFormSection();

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

    $('#remove_section').click(function (event) {
        event.preventDefault();
        //console.log($(this).parent().parent().parent().parent());
        console.log($(this).parents('#section'));
        $(this).parents('#section').remove();

    })

});
