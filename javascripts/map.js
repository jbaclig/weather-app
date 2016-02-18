var map;

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  //Creat search box and link to UI element
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  //Bias the SearchBox results towards current map's viewport
  map.addListener('bounds_changed',function(){
    searchBox.setBounds(map.getBounds());
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

  var markers = [];
  // [START region_getplaces]
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed',function() {
    var places = searchBox.getPlaces();

    if(places.length==0) {
      return;
    }

    //Clear out old markers
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    //For each place, get the icon, name, and location
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71,71),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(17,34),
        scaledSize: new google.maps.Size(25,25)
      };

      //Create a marker for each place
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if(place.geometry.viewport) {
        //Only geocodes have viewport
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location)
      }

      //Update forecast info
      var latLng = bounds.getCenter();
      var lat = latLng.lat();
      var lng = latLng.lng();
      $('#forecast').remove();
      getForecast(lat,lng);
    });
    map.fitBounds(bounds);
  });
  //[END region_getplaces]
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
  forecastDiv.className = "forecast container-fluid";

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
    dayDiv.className = "forecast__day col-md-1";

    //create header for forecast day name
    if(i==0) {
      dayHeader = createHeader('h2',"Today");
      dayHeader.className = "forecast__day__header forecast__today__header";
      dayDiv.className += " forecast__today col-md-7";
    } else {
      dayHeader = createHeader('h3',currentDayName);
      dayHeader.className = "forecast__day__header";
    }

    //create object for forecast data
    var dayDataDiv = document.createElement('div');
    dayDataDiv.className = "forecast__day__data";

    var icon = document.createElement('span');
    icon.className = "glyphicon glyphicon-search";

    //weather summary
    var daySummary = document.createElement('p');
    daySummary.innerHTML= forecastData[i].summary;

    dayDataDiv.appendChild(icon);
    dayDataDiv.appendChild(daySummary);

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
