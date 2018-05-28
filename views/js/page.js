
$(function () {
    $('.ui.dropdown').dropdown({ on: 'hover' }); // Initialize dropdown menu.
    $('#dashboard_menu > a.item').each(function (idx, element) {
        $(this).tab();
    });

    $('#lesser_menu > .ui.container > a.item').click(function () {
        $('.ui.labeled.icon.sidebar').sidebar('toggle');
    });

    $('#full_menu > .ui.container > .ui.dropdown.item').click(function () {
        console.log('dropdown click')
        $(this).dropdown();
    })

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
    $('.ext_top_row, .ext_middle_row, .ext_bottom_row').click(function() {
        if(!$(this).children('#content_hide').height()) {
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
                url: 'http://localhost:5000/stores/'
            },
            filterRemoteData: false,

            saveRemoteData: false,
            fullTextSearch: 'exact',
            direction: 'auto',
            debug: true
        })


});
