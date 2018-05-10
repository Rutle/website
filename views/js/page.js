
$(function() {
  $('.ui.dropdown').dropdown({on: 'hover'}); // Initialize dropdown menu.

  
  $('#lesser_menu > .ui.container > a.item').click(function() {
    $('.ui.labeled.icon.sidebar')
      .sidebar('setting', 'transition', 'overlay')
      .sidebar('toggle');
  });

  $('#full_menu > .ui.container > .ui.dropdown.item').click(function() {
    console.log('dropdown click')
    $(this).dropdown();
  })

});
