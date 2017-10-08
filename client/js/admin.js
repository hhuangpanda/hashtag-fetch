var socket = io();

$('#admin-filter-form-select').change(function(){
  $('#admin-filter-form').attr('formtype', $('#admin-filter-form-select').val());
});

$('#admin-filter-form').on('submit', function(e) {
  e.preventDefault();

  var adminFilter = $( this ).serializeArray().reduce(function(obj, arrElement) {
    if (arrElement.value) {
      obj[arrElement.name] = arrElement.value;
    }
    return obj;
  }, {});

  if ($('#currentAdminFilter').length == 0) {
    var currentFilter = $('<div> Current Filter Settings: </div>').attr('id','currentAdminFilter');

    var Hashtag = $('<p></p>').html(`Hashtag: ${adminFilter.track ? adminFilter.track : ''}`).appendTo(currentFilter);
    $('<p></p>').html(`Location: ${adminFilter.location ? adminFilter.location : ''}`).appendTo(currentFilter);
    $('<p></p>').html(`User Name: ${adminFilter.follow ? adminFilter.follow : ''}`).appendTo(currentFilter);

    $('body').prepend(currentFilter);

  }

  socket.emit('adminFilterInput', [adminFilter, $('#admin-filter-form').attr('formtype')]);

  $('#hashtag-inputt').val('');


});
