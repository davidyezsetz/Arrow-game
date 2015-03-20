$( function() {

  var bodyHeight = $( 'body' ).height();
  var height = ( bodyHeight / 2 ) - 375;
  $( '#wrapper' ).css({
    'top': height + 'px',
    'display': 'block'
  });
});