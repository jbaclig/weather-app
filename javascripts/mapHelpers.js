//Helper functions for map.js

function createHeader(headerType,content){
  var header = document.createElement('header');
  var h = document.createElement(headerType);
  h.innerHTML = content;
  header.appendChild(h);
  return header;
}

function appendToBody(child) {
  $('body').append(child);
}

function scrollToForecast(){
  $('html, body').animate({
    scrollTop: $('#forecast').offset().top
  },500);
}

function removeForecast(){
  $('#forecast').hide('slow',function(){ $('#forecast').remove(); });
}
