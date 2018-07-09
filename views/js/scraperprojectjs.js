$(function () {
    'use strict'
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
                let storeCell = row.insertCell(2);
                let saleCell = row.insertCell(3);
                let normCell = row.insertCell(4);
                nameCell.innerHTML = elem.name;
                catCell.innerHTML = elem.category;
                saleCell.innerHTML = elem.latestSalePrice;
                normCell.innerHTML = elem.latestNormalPrice == undefined ? 'N/A' : elem.latestNormalPrice;
                storeCell.innerHTML = elem.storeName;
                tableIdx++;
            } else if (category === elem.category) {
                let row = table.insertRow(tableIdx);
                let nameCell = row.insertCell(0);
                let catCell = row.insertCell(1);
                let storeCell = row.insertCell(2);
                let saleCell = row.insertCell(3);
                let normCell = row.insertCell(4);
                nameCell.innerHTML = elem.name;
                catCell.innerHTML = elem.category;
                saleCell.innerHTML = elem.latestSalePrice;
                storeCell.innerHTML = elem.storeName;
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
                $.ajax({
                    type: 'GET',
                    url: '/api/storecampaigns/' + value,
                    dataType: 'JSON',
                    success: function (data) {
                        console.log('build campaing list: ', data.results)
                        buildCampaignList(data.results);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        let camp = document.getElementById("store_keyword_error_messages");
                        let customErrorMessages = JSON.parse(jqXHR.responseText);
                        while (camp.firstChild) {
                            camp.removeChild(camp.firstChild);
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

                        //$('#modify_store_keywords_form').removeClass('loading');
                        //let customErrorMessages = JSON.parse(jqXHR.responseText);
                        //console.log("Given error response: ", customErrorMessages);
                    }
                })

            },
            saveRemoteData: false,
            fullTextSearch: 'exact',
            direction: 'auto'
        });

    function removeCampaign(event) {
        event.preventDefault();
        //console.log(this)
        //console.log(event);
        let parentFields = $(this).parent().parent();
        let name = parentFields.children().eq(1).children().first().val();
        let url = parentFields.children().eq(2).children().first().val();
        let id = $('#store_keywords').dropdown('get value');
        console.log(name, url, id);
        //$('#modify_store_keywords_form').addClass('loading');
        $.ajax({
            method: 'POST',
            url: '/dashboard/scraper/removecampaign',
            data: { name: name, url: url, storeId: id },
            dataType: 'JSON',
            success: function (data) {
                $(parentFields)
                    .transition({
                        animation: 'slide down',
                        duration: '0.5s',
                        onComplete: function () {
                            parentFields.remove();
                        }

                    });
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        })
        //
    }
    /**
     * 
     * @param {Object} campObj 
     */
    function addCampaignRow(campObj) {
        let camp = document.getElementById("campaign-container");

        let iFields = document.createElement("div");
        iFields.className = "inline fields";

        let removeField = document.createElement("div");
        removeField.className = "field";
        let rBtn = document.createElement("button");
        rBtn.className = "ui tiny icon negative button";
        let rIcon = document.createElement("i");
        rIcon.className = "delete icon";
        rBtn.onclick = removeCampaign;
        rBtn.appendChild(rIcon);
        removeField.appendChild(rBtn);
        iFields.appendChild(removeField);

        let nameField = document.createElement("div");
        nameField.className = "field";
        let nameInput = document.createElement("input");
        nameInput.setAttribute("type", "text");
        nameInput.setAttribute("value", campObj.name);
        nameInput.setAttribute("disabled", "");
        nameField.appendChild(nameInput);
        iFields.appendChild(nameField);

        let urlField = document.createElement("div");
        urlField.className = "field";
        let urlInput = document.createElement("input");
        urlInput.setAttribute("type", "url");
        urlInput.setAttribute("value", campObj.url);
        urlInput.setAttribute("disabled", "");
        urlField.appendChild(urlInput);
        iFields.appendChild(urlField);

        let toggleField = document.createElement("div");
        toggleField.className = "field";
        let toggleDiv = document.createElement("div");
        toggleDiv.className = "ui toggle checkbox";
        let toggleInput = document.createElement("input");
        toggleInput.setAttribute("type", "checkbox");
        toggleDiv.appendChild(toggleInput);
        toggleField.appendChild(toggleDiv);
        iFields.appendChild(toggleField);
        camp.appendChild(iFields);

        $(toggleDiv).checkbox({
            onChecked: function () {
                let parentFields = $(this).parent().parent().parent();
                let name = parentFields.children().eq(1).children().first().val();
                let url = parentFields.children().eq(2).children().first().val();
                let id = $('#store_keywords').dropdown('get value');
                console.log(name, url, id);
                $(this).checkbox('set disabled');
                $.ajax({
                    method: 'POST',
                    url: '/dashboard/scraper/toggleactivity',
                    data: { name: name, url: url, storeId: id, isActive: true },
                    dataType: 'JSON',
                    success: function (data) {

                        $(this).checkbox('set enabled');

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                })
                console.log("Checked");
            },
            onUnchecked: function () {
                let parentFields = $(this).parent().parent().parent();
                let name = parentFields.children().eq(1).children().first().val();
                let url = parentFields.children().eq(2).children().first().val();
                let id = $('#store_keywords').dropdown('get value');
                console.log(name, url, id);
                $(this).checkbox('set disabled');
                $.ajax({
                    method: 'POST',
                    url: '/dashboard/scraper/toggleactivity',
                    data: { name: name, url: url, storeId: id, isActive: false },
                    dataType: 'JSON',
                    success: function (data) {

                        $(this).checkbox('set enabled');

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                });
                console.log("Unchecked");
            }
        });
        campObj.isActive ? $(toggleDiv).checkbox('set checked') : $(toggleDiv).checkbox('set unchecked');
    }

    /**
     * Function to generate list to the store keyword's form to activate and deactivate campaigns.
     * @param {Array} campaigns Contains store's different active and inactive campaigns.
     */
    function buildCampaignList(campaigns) {
        let camp = document.getElementById("campaign-container");

        while (camp.firstChild) {
            camp.removeChild(camp.firstChild);
        }

        if (campaigns.length === 0) {
            let messageField = document.createElement("div");
            messageField.className = "field";
            let messageDiv = document.createElement("div");
            messageDiv.className = "ui message";
            let headerDiv = document.createElement("div");
            headerDiv.className = "header";
            headerDiv.innerHTML = "No campaigns found."
            messageDiv.appendChild(headerDiv);
            messageField.appendChild(messageDiv);
            camp.appendChild(messageField);
            return;
        }

        campaigns.forEach(function (elem, idx) {
            addCampaignRow(elem);
        });
        //$('#modify_store_keywords_form .ui.checkbox').checkbox();
    }

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

    });
    $('#add_campaign').click(function (event) {
        event.preventDefault();
        let errorsM = [];
        let cUrl = document.getElementById('campaign_url').value;
        let cName = document.getElementById('campaign_name').value;
        console
        if (cUrl === '' || cUrl === undefined) {
            errorsM.push({ name: 'campaign_url', value: 'Please write the URL of the campaign.' })
        }
        if (cName === '' || cName === undefined) {
            errorsM.push({ name: 'campaign_name', value: 'Please write the name of the campaign.' })
        }
        if (errorsM.length > 0) {
            addErrorMessages(errorsM, 'store_keyword_error_messages', 'input');
            return;
        }

        let storeId = $('#store_keywords').dropdown('get value')
        $.ajax({
            method: 'POST',
            url: '/dashboard/scraper/addcampaign',
            data: { storeId: storeId, url: cUrl, name: cName },
            dataType: 'JSON',
            success: function (data) {
                buildCampaignList(data.results);
            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        })
    })

    $('#new_store_form')
        .form({
            on: 'blur',
            fields: {
                store_name: 'empty',
                store_url: ['empty', 'url'],
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
                let table = document.getElementById('').getElementsByTagName('tbody')[0];
                if(table.childElementCount === 0) {
                    data.newInsertByStore.forEach(function (elem, idx) {
                        let row = table.insertRow(idx);
                        let nameCell = row.insertCell(0);
                        let countCell = row.insertCell(1);
                        let dateCell = row.insertCell(2);
                        nameCell.innerHTML = elem.storeName;
                        countCell.innerHTML = elem.count;
                        countCell.setAttribute('id', elem.storeName + '_count');
                        dateCell.innerHTML = 'Today'
                    });
                } else {
                    data.newInsertByStore.forEach(function (elem, idx) {
                        console.log(typeof (elem.count));
                        if (elem.count > 0) {
                            let cell = document.getElementById(elem.storeName + '_count');
                            cell.innerHTML = cell.innerHTML + ' (+' + elem.count + ')';
                            cell.className = 'positive';
                        }
                    });
                }

                $('#update_sales_data').removeClass('loading');

            },
            error: function (jqXHR, textStatus, errorThrown) {

            }
        });
    });
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



});