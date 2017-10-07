var socket = io();

$('#admin-filter-form').on('submit', function(e) {
  e.preventDefault();
  var adminFilter = $( this ).serializeArray().reduce(function(obj, arrElement) {
    if (arrElement.value) {
      obj[arrElement.name] = arrElement.value;
    }
    return obj;
  }, {});

  socket.emit('adminFilterInput', adminFilter);


});
