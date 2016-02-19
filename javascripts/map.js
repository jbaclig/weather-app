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

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var marker = new google.maps.Marker({
        position: pos,
        map: map
      });
      map.setCenter(pos);
      getForecast (pos.lat,pos.lng);
    }, function(){
      handleLocationError(true,map.getCenter());
    });
  } else {
    handleLocationError(false,map.getCenter());
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
      $('#forecast').hide('slow',function(){ $('#forecast').remove(); });
      getForecast(lat,lng);
    });
    map.fitBounds(bounds);
  });
  //[END region_getplaces]
}

function handleLocationError(browserHasGeolocation,pos) {
  alert(browserHasGeolocation ?
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
  forecastDiv.className = "forecast container-fluid text-center animated fadeIn";

  var location = document.getElementById('pac-input').value;
  if(!location) {
    location = "Your Location";
  }

  var locationHeader = document.createElement('h1');
  locationHeader.innerHTML = location;
  forecastDiv.appendChild(locationHeader);

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
    var data = forecastData[i];
    var dayDataDiv = document.createElement('div');
    dayDataDiv.className = "forecast__day__data";

    //forecast icon
    var iconContainer = document.createElement('ul');
    iconContainer.className = "icon";
    var iconDescription = data.icon;

    var iconHtml;
    switch(iconDescription) {
      case "clear-day":
            iconHtml = "<li class=\"clear-day animated rotateIn\"></li>";
            break;
      case "clear-night":
            iconHtml = "<li class=\"clear-night animated pulse\"></li>";
            break;
      case "rain":
            iconHtml = "<li class=\"base-cloud\"></li><li class=\"rain animated rubberBand\"></li>";
            break;
      case "snow":
            iconHtml = "<li class=\"base-cloud\"></li><li class=\"snow animated flip\"></li>";
            break;
      case "sleet":
            iconHtml = "<li class=\"base-cloud\"></li><li class=\"sleet animated swing\"></li>";
            break;
      case "wind":
            iconHtml = "<li class=\"base-cloud\"><li class=\"wind animated shake\"></li>";
            break;
      case "fog":
            iconHtml = "<li class=\"fog animated jello\"></li>";
            break;
      case "cloudy":
            iconHtml = "<li class=\"cloudy animated fadeInLeft\"></li>";
            break;
      case "partly-cloudy-day":
            iconHtml = "<li class=\"partly-cloudy\"></li><li class=\"day animated wobble\"></li>";
            break;
      case "partly-cloudy-night":
            iconHtml = "<li class=\"partly-cloudy\"></li><li class=\"night animated wobble\"></li>";
            break;
    }
    iconContainer.innerHTML = iconHtml;
    var icon = document.createElement('li');
    icon.className = data;

    //high and low temps
    var tempHigh = document.createElement('p');
    tempHigh.innerHTML = data.temperatureMax + "&deg;";

    var tempLow = document.createElement('p');
    tempLow.innerHTML = data.temperatureMin + "&deg;";

    //weather summary
    var daySummary = document.createElement('p');
    daySummary.innerHTML= data.summary;

    iconContainer.appendChild(icon);
    dayDataDiv.appendChild(iconContainer);
    dayDataDiv.appendChild(tempHigh);
    dayDataDiv.appendChild(tempLow);
    dayDataDiv.appendChild(daySummary);

    dayDiv.appendChild(dayHeader);
    dayDiv.appendChild(dayDataDiv);
    forecastDiv.appendChild(dayDiv);
    $('body').append(forecastDiv);
  }
  scrollToForecast();
}

function createHeader(headerType,content){
  var header = document.createElement('header');
  var h = document.createElement(headerType);
  h.innerHTML = content;
  header.appendChild(h);
  return header;
}

function scrollToForecast(){
  $('html, body').animate({
    scrollTop: $('#forecast').offset().top
  },500);
}

function fadeOut(element){
  $(element).removeClass("fadeIn").addClass("fadeOut");
}
