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

    /**
     * Function to add error messages to a form's error message box and input/dropdown fields.
     * @param {Array} messages Contains objects {name, value} where name is the id of the error causing field and value is the error message.
     * @param {String} divId Id of the error message div.
     * @param {String} type Type of the input: Dropdown etc.
     */
    function addErrorMessages(messages, divId, type = 'none') {
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
            if (type !== 'none') { addErrorInfo(elem.name, type); }
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
                        //addErrorMessages(messages, divId, type, messagesOnly = false)
                    }
                })

            },
            saveRemoteData: false,
            fullTextSearch: 'exact',
            direction: 'auto'
        });

    function removeCampaign(event) {
        event.preventDefault();

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
     * Function to add rows to 'campaign-container' in a form.
     * @param {Object} campObj Object in the form of {name:'string', url: 'string', isActive: 'boolean'}
     */
    function addCampaignRow(campObj) {
        let camp = document.getElementById("campaign-container");

        let iFields = document.createElement("div");
        iFields.className = "fields";

        let removeField = document.createElement("div");
        removeField.className = "field";
        let rBtn = document.createElement("button");
        rBtn.className = "ui tiny icon negative button";
        $(rBtn).popup({
            content: 'Remove campaign',
            position: 'left center'
        });
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
        $(nameField).popup({
            content: campObj.name,
            position: 'top center'
        });
        iFields.appendChild(nameField);

        let urlField = document.createElement("div");
        urlField.className = "field";
        let urlInput = document.createElement("input");
        urlInput.setAttribute("type", "url");
        urlInput.setAttribute("value", campObj.url);
        urlInput.setAttribute("disabled", "");
        urlField.appendChild(urlInput);
        $(urlField).popup({
            content: campObj.url,
            position: 'top center'
        });
        iFields.appendChild(urlField);

        let toggleField = document.createElement("div");
        toggleField.className = "field";
        let toggleDiv = document.createElement("div");
        toggleDiv.className = "ui toggle checkbox";
        let toggleInput = document.createElement("input");
        toggleInput.setAttribute("type", "checkbox");
        toggleDiv.appendChild(toggleInput);
        $(urlField).popup({
            content: 'Activate/Deactivate',
            position: 'right center'
        });
        toggleField.appendChild(toggleDiv);
        iFields.appendChild(toggleField);
        camp.appendChild(iFields);

        $(toggleDiv).checkbox({
            onChecked: function () {
                let parentFields = $(this).parent().parent().parent();
                let name = parentFields.children().eq(1).children().first().val();
                let url = parentFields.children().eq(2).children().first().val();
                let id = $('#store_keywords').dropdown('get value');

                $.ajax({
                    method: 'POST',
                    url: '/dashboard/scraper/toggleactivity',
                    data: { name: name, url: url, storeId: id, isActive: true },
                    dataType: 'JSON',
                    success: function (data) {

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                })
            },
            onUnchecked: function () {
                let parentFields = $(this).parent().parent().parent();
                let name = parentFields.children().eq(1).children().first().val();
                let url = parentFields.children().eq(2).children().first().val();
                let id = $('#store_keywords').dropdown('get value');

                $.ajax({
                    method: 'POST',
                    url: '/dashboard/scraper/toggleactivity',
                    data: { name: name, url: url, storeId: id, isActive: false },
                    dataType: 'JSON',
                    success: function (data) {

                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                    }
                });
            }
        }); //.checkbox(campObj.isActive ? 'set checked' : 'set unchecked');
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
                    //console.log("Given error response: ", customErrorMessages);
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
                    url: '/dashboard/scraper/newstore',
                    data: {
                        form: JSON.parse(JSON.stringify($('#new_store_form').serializeArray())),
                    },
                    dataType: 'json',
                    success: function (data) {
                        $('#new_store_form').removeClass('loading');

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
                        let errMessages = JSON.parse(jqXHR.responseText);
                        errMessages = errMessages.messages;
                        addErrorMessages(errMessages, 'store_error_messages', 'none');
                        $('#new_store_form').removeClass('loading');

                    }
                });
            }
        });
    /**
     * Function to refresh/populate the store_sata table with current stats.
     * @param {Object} obj Contains relevant information received from server for a row.
     * @param {HTMLTableSectionElement} table The table that this function is being applied to.
     * @param {Number} idx Current row index.
     */
    function populateStoreStats(tableId, data) {
        let table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
        for (let i = table.rows.length - 1; i >= 0; --i) {
            table.rows[i].remove();
        }
        data.forEach(function (elem, idx) {
            let row = table.insertRow(idx);
            let nameCell = row.insertCell(0);
            let countCell = row.insertCell(1);
            let dateCell = row.insertCell(2);
            nameCell.innerHTML = elem.storeName;
            countCell.innerHTML = elem.count;
            countCell.setAttribute('id', elem.storeName + '_count');
            dateCell.innerHTML = 'Today'
        })

    }

    function addTableErrorMessage(tableId, errMessage) {
        let table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
        for (let i = table.rows.length - 1; i >= 0; --i) {
            table.rows[i].remove();
        }
        let row = table.insertRow(0);
        row.className = "warning";
        let errorMessage = row.insertCell(0);
        errorMessage.colSpan = 3;
        errorMessage.innerHTML = errMessage;
    }

    $('#refresh_sales_data').click(function (event) {
        event.preventDefault();
        $.ajax({
            method: 'GET',
            url: '/api/scraper/salesdata',
            dataType: 'json',
            success: function (data) {
                populateStoreStats('store_data', data.data);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                let errMessage = JSON.parse(jqXHR.responseText);
                errMessage = errMessage.message;
                addTableErrorMessage('store_data', errMessage);

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
                let table = document.getElementById('store_data').getElementsByTagName('tbody')[0];
                if (table.childElementCount === 0) {
                    populateStoreStats('store_data', data.newInsertByStore);
                } else {
                    // Insert additional text to each counter to indicate how many new products were added to database.
                    data.newInsertByStore.forEach(function (elem, idx) {
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
                url: 'http://localhost:5000/api/stores/'
            },
            onChange: function (value, text, $choice) {
                // Fetch data from sessionStorage
                let storeData = JSON.parse((sessionStorage.getItem('salesData')));
                storeData = (text === 'All stores' ? storeData : storeData.filter(elem => elem.storeName === text));
                let categories = JSON.parse((sessionStorage.getItem('storeCategories')));

                //Initialize dropdown with selected values
                $('#category_dpn').dropdown({
                    values: categories[text],

                    // On selected choice populate the sales table based on data and chosen category.
                    onChange: function (value, categoryText, $choice) {
                        let storeText = $('#store_dpn').dropdown('get text');
                        let storeData = JSON.parse((sessionStorage.getItem('salesData')));
                        storeData = (storeText === 'All stores' ? storeData : storeData.filter(elem => elem.storeName === text));
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