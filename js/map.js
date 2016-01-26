var map;

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });
  var infoWindow = new google.maps.InfoWindow({map: map});

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Location found.');
      map.setCenter(pos);
      getForecast (pos.lat,pos.lng);
    }, function(){
      handleLocationError(true,infoWindow,map.getCenter());
    });
  } else {
    handleLocationError(false,infoWindow,map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation,infoWindow,pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

function getForecast(lat,lng) {
  var forecastUrl = "https://api.forecast.io/forecast/db0083fb66a7977addddf573bca4f465/"+lat+","+lng;

  $.ajax({
    type: 'GET',
    url: forecastUrl,
    dataType: 'jsonp',
    success: function(forecast) {
      displayForecast(forecast);
    },
    error: function() {
      alert("error getting forecast");
    }
  });
}

function displayForecast(forecast) {
  //create parent div for forecast
  var forecastDiv = document.createElement('div');
  forecastDiv.id = "forecast";
  forecastDiv.className = "forecast";

  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var date = new Date();
  var today = date.getDay();
  var forecastData = forecast.daily.data;

  for(var i=0;i < forecastData.length;i++){
    //get Name of day
    var currentDay = today+i;
    if(currentDay > 6)
      currentDay -= 7;
    var currentDayName = days[currentDay];

    //create div for day
    var dayDiv = document.createElement('div');
    dayDiv.className = "forecast__day";

    //create header for forecast day name
    if(i==0) {
      dayHeader = createHeader('h2',"Today");
      dayHeader.className = "forecast__day__header forecast__today__header";
      dayDiv.className += " forecast__today";
    } else {
      dayHeader = createHeader('h3',currentDayName);
      dayHeader.className = "forecast__day__header";
    }

    //create object for forecast data
    var dayDataDiv = document.createElement('div');
    dayDataDiv.className = "forecast__day__data";
    var dayData = document.createElement('p');
    dayData.innerHTML= forecastData[i].summary;
    dayDataDiv.appendChild(dayData);

    dayDiv.appendChild(dayHeader);
    dayDiv.appendChild(dayDataDiv);
    forecastDiv.appendChild(dayDiv);
  }
  $('body').append(forecastDiv);
}

function createHeader(headerType,content){
  var header = document.createElement('header');
  var h = document.createElement(headerType);
  h.innerHTML = content;
  header.appendChild(h);
  return header;
}
