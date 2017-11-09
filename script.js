var map,
    markers = [],
    largeInfowindow,
    placeMarkers = [];

var local = [
    {
        Title: 'Waterfront Park',
        lat: 32.7219903,
        lng: -117.1726884,
        id: '40e0b100f964a5209c011fe3'
    },
    {
        Title: 'Aero Club Bar',
        lat: 32.738019,
        lng: -117.176591,
        id: '40e0b100f964a5209c011fe3'
    },
    {
        Title: 'SeaWorld San Diego',
        lat: 32.764720,
        lng: -117.225249,
        id: '40e0b100f964a5209c011fe3'
    },
    {
        Title: 'Ocean Beach Dog Beach',
        lat: 32.754438,
        lng: -117.252425,
        id: '40e0b100f964a5209c011fe3'
    },
    {
        Title: 'San Diego Zoo',
        lat: 32.732901,
        lng: -117.1476879,
        id: '40e0b100f964a5209c011fe3'
    },
    {
        Title: 'San Diego International Airport',
        lat: 32.7327628,
        lng: -117.1952763,
        id: '40e0b100f964a5209c011fe3'
    }
];

function initMap() {
    // Create a styles array to use with the map.
    var styles = [{
        featureType: 'water',
        stylers: [{
            color: '#87CEFA'
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
                color: '#ffffff'
            },
            {
                weight: 6
            }
        ]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#D2B48C'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -40
            }
        ]
    }, {
        featureType: 'transit.station',
        stylers: [{
                weight: 9
            },
            {
                hue: '#D2B48C'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            lightness: 100
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            lightness: -100
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
                visibility: 'on'
            },
            {
                color: '#6B8E23'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
                color: '#DAA520'
            },
            {
                lightness: -25
            }
        ]
    }];

    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 32.750864,
            lng: -117.141344
        },
        zoom: 12,
        styles: styles,
        mapTypeControl: false
    });

    {
        var trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
    }

    // These are the real estate listings that will be shown to the user.
    // Normally we'd have these in a database instead.

    largeInfowindow = new google.maps.InfoWindow();

    // Style the markers a bit. This will be our listing marker icon.
    var defaultIcon = makeMarkerIcon('0091ff');

    // Create a "highlighted location" marker color for when the user
    // mouses over the marker.
    var highlightedIcon = makeMarkerIcon('FFFF24');
    var appear = function () {
        populateInfoWindow(this, largeInfowindow);
    };
    var hover = function () {
        this.setIcon(highlightedIcon);
    };
    var end = function () {
        this.setIcon(defaultIcon);
    };
    var animate = google.maps.event.addListener(map, 'idle', function () {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    });
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < local.length; i++) {
        // Get the position from the location array.
        var position = local[i].local;
        var title = local[i].title;
        local[i].marker = marker;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', appear);
        // Two event listeners - one for mouseover, one for mouseout,
        // to change the colors back and forth.
        marker.addListener('mouseover', hover);
        marker.addListener('mouseout', end);
    }
    ko.applyBindings(new ViewModel());
    window.onload = function () {
        wikiload();
    };


}

function populateInfoWindow(marker) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (largeInfowindow.marker != marker) {
        // Clear the infowindow content to give the streetview time to load.
        largeInfowindow.setContent('');
        largeInfowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        largeInfowindow.addListener('closeclick', function () {
            largeInfowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        var getStreetView = function () {};
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        getStreetView = function (data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);

                largeInfowindow.setContent(marker.contentString + '<div>' + marker.title + '</div><div id="pano"></div>');

                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                largeInfowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        };
        // Use streetview service to get the closest streetview image within
        // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        // Open the infowindow on the correct marker.
        largeInfowindow.open(map, marker);
    }
}

function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}

var Location = function (data) {
    var self = this;
    this.Title = data.Title;
    this.lat = data.lat;
    this.lng = data.lng;
    this.id = data.id;
    this.city = ko.observable("");
    this.url = ko.observable("");
    this.street = ko.observable("");
    this.address = ko.observable("");
    this.phone = ko.observable("");

    Square(this);

    this.visible = ko.observable(true);

    this.infoWindow = new google.maps.InfoWindow();

    // ko computed observables watch other observables and update when the dependencies change
    this.makeInfoWindowContent = ko.computed(function() {
        // attach content string to the marker object
        const contentString = '<div class="info-window-content"><div class="title"><b><a href="' + self.url() + '">' + data.Title + "</a></b></div>" +
        '<div class="content">' + self.street() + "</div>" +
        '<div class="content">' + self.city() + "</div>" +
        '<div class="content">' + self.address() + "</div>" +
        '<div class="content">' + self.phone() + "</div>";

        self.infoWindow.setContent(contentString);
    });

    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: map,
        title: data.Title
    });

    this.showMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    this.marker.addListener('click', function () {

        self.infoWindow.open(map, this);
      

        //self.infoWindow.setContent(self.contentString);

        //self.infoWindow.open(map, this);

        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            self.marker.setAnimation(null);
        }, 2100);
    });

    this.bounce = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function ViewModel() {
    var self = this;

    this.searchTerm = ko.observable("");

    this.locationList = ko.observableArray([]);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: {
            lat: 32.742237,
            lng: -117.185009
        }
    });

    local.forEach(function (locationItem) {
        self.locationList.push(new Location(locationItem));
    });

    this.filteredList = ko.computed(function () {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function (locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (locationItem) {
                var string = locationItem.Title.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);

    this.mapElem = document.getElementById('map');
    this.mapElem.style.height = window.innerHeight - 50;
}

function errorMessage() {
    alert("Knockout binding has failed");
    document.getElementById("map").style.backgroundColor = "#ffffff";
}

function wikiload() {

    var $wikiElem = $('#data');
    place = 'San Diego';
    // clear out old data before new request
    $wikiElem.text("");

    // wikipedia
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + place + '&format=json&callback=wikiCallback';

    var wikiRequestTimeout = setTimeout(function () {
        $wikiElem.text("Failed to get wikipedia resources");
    }, 8000);

    $.ajax({
        url: wikiURL,
        dataType: "jsonp",
        jsonp: "callback",
        success: function (response) {
            var articleList = response[1];
            for (var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a><li>');
            }
            clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
}

function Square(data) {
 
    records = JSON.parse(localStorage.getItem('records'));
    if (records === null) {
        records = {
            food: true,
            shops: false,
            outdoors: false
        };
        localStorage.setItem('records', JSON.stringify(records));
    }

    var category = [];
    var clientID = "5T4XZTVTZ0UTLL13L4PQPFM2XRZDXTKEYMH2D5UYGQIAT2XN";
    var clientSecret = "NN4WP53J13K4TYJD4RY1HXU10HI14LHCYQMDOL30EVXRFVF5";
    //var SquareUrl = "https://api.foursquare.com/v2/venues/40e0b100f964a5209c011fe3&client_id=" + clientID + "&client_secret=" + clientSecret + "&v=20170928";
    var SquareUrl = "https://api.foursquare.com/v2/venues/search?ll=" + data.lat + "," + data.lng + "&client_id=" + clientID + "&client_secret=" + clientSecret + "&v=20170928" + "&query=" + data.Title;
    if (records.food) category.push('food');
    if (records.shops) category.push('shops');
    if (records.outdoors) category.push('outdoors');
    $.getJSON(SquareUrl, function (result) {

        //var address = result.response.venues[0].location.address;
      //  console.log(result.response.venues[0].location.address)
      console.log(result.response.venues[0]);
      const address = result.response.venues[0].location.formattedAddress[0];
      const url = result.response.venues[0].url;
      const city = result.response.venues[0].location.city;
      const phone = result.response.venues[0].contact.formattedPhone;
      // write data to observables
      data.address(address);
      data.url(url);
      data.city(city);
      data.phone(phone);

        //return result.response.venues[0].location.address;

        var help = [];
        //filter if statement
        /*for (var el in items) {
            var place = parseVenue(items[el]);
            help.push(place);
        }*/

     //   state = 'loaded';
      //  venues = help;
    }, function (data, status) {
        state = 'noResult';
        errorMessage();
    });
   // return false;
}
/*function(yelpload){
const yelp = require('yelp-fusion');

// Place holders for Yelp Fusion's OAuth 2.0 credentials. Grab them
// from https://www.yelp.com/developers/v3/manage_app
const clientId = '38zxH5g3Qe15UOIyvOm-VQ';
const clientSecret = '2TnMQ1SyQqXZ7vRiPxjHcSemyZ0CliUfM2hjSeH73yE0A6iEQhbXp2sMfRAuCVj3';

const searchRequest = local;

yelp.accessToken(clientId, clientSecret).then(response => {
  const client = yelp.client(response.jsonBody.access_token);

  client.search(searchRequest).then(response => {
    const firstResult = response.jsonBody.businesses[0];
    const prettyJson = JSON.stringify(firstResult, null, 4);
    console.log(prettyJson);
  });
}).catch(e => {
  console.log(e);
});

$.ajax({
      dataType: "POST",
      url: "https://api.yelp.com/oauth2/token",
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      success: function(data,textStatus,jqXHR) {
        console.log(data,textStatus,jqXHR);
      }
    });
}*/