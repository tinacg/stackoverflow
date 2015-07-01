"use strict";

var map;
var allowedBounds;
var latbound;
var lngbound;

var widthPercent;
var heightPercent;

var bounds;
var sw;
var ne;
var width;
var height;

// define image geometry
var imageWidth = 120;
var imageHeight = 120;

if (imageWidth > imageHeight) {
  widthPercent = 100;
  heightPercent = imageHeight / imageWidth * 100;
}
else {
  heightPercent = 100;
  widthPercent = imageWidth / imageHeight * 100;
}

function addMarker(lat, lng) {
  new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
  }).setMap(map);
}

function describeBounds() {
  var bounds = map.getBounds();
  console.log("bottom left: ");
  console.log(bounds.getSouthWest().lat() + ", " + bounds.getSouthWest().lng());
  console.log(bounds.getNorthEast().lat() + ", " + bounds.getNorthEast().lng());
}

function updateEdge() {
  //imageWidth = parseInt(document.getElementById("imgWidth").value);
  //imageHeight = parseInt(document.getElementById("imgHeight").value);

  latbound = heightPercent/2.0;
  lngbound = widthPercent/2.0;

  bounds = map.getBounds();
  console.log("bottom left: ");
  console.log(bounds.getSouthWest().lat() + ", " + bounds.getSouthWest().lng());
  console.log(bounds.getNorthEast().lat() + ", " + bounds.getNorthEast().lng());
  
  sw = bounds.getSouthWest();
  ne = bounds.getNorthEast();
  width = ne.lng() - sw.lng();
  height = ne.lat() - sw.lat();

  console.log("w + h");
  console.log(width);
  console.log(height);
  
  var bottom = Math.min(-latbound+(height/2),-0.000001);
  var left = Math.min(-lngbound+(width/2),-0.000001);
  var top = Math.max(latbound-(height/2),0.000001);
  var right = Math.max(lngbound-(width/2),0.000001);

  allowedBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(bottom,left),
    new google.maps.LatLng(top,right));
}


function boxIn() {
  if (allowedBounds.contains(map.getCenter())) {
    return;
  }
  else {
    var mapCenter = map.getCenter();
    var X = mapCenter.lng();
    var Y = mapCenter.lat();

    var AmaxX = allowedBounds.getNorthEast().lng();
    var AmaxY = allowedBounds.getNorthEast().lat();
    var AminX = allowedBounds.getSouthWest().lng();
    var AminY = allowedBounds.getSouthWest().lat();

    if (X < AminX) {
      X = AminX;
    }
    if (X > AmaxX) {
      X = AmaxX;
    }
    if (Y < AminY) {
      Y = AminY;
    }
    if (Y > AmaxY) {
      Y = AmaxY;
    }

    map.setCenter(new google.maps.LatLng(Y, X));
  }
}

var moonTypeOptions = {
  getTileUrl: function(coord, zoom) {
    var normalizedCoord = getNormalizedCoord(coord, zoom);
    if (!normalizedCoord) {
      return null;
    }
    var bound = Math.pow(2, zoom);
    return 'http://mw1.google.com/mw-planetary/lunar/lunarmaps_v1/clem_bw' +
      '/' + zoom + '/' + normalizedCoord.x + '/' +
      (bound - normalizedCoord.y - 1) + '.jpg';
  },
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 9,
  minZoom: 0,
  radius: 1738000,
  name: 'Moon'
};

var moonMapType = new google.maps.ImageMapType(moonTypeOptions);

function initialize() {
  var myLatlng = new google.maps.LatLng(0, 0);
  var mapOptions = {
    center: myLatlng,
    zoom: 1,
    streetViewControl: false,
    mapTypeControlOptions: {
      mapTypeIds: ['moon']
    }
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
                            mapOptions);
  map.mapTypes.set('moon', moonMapType);
  map.setMapTypeId('moon');


  google.maps.event.addListener(map, 'tilesloaded', function() {
    updateEdge();
  });
  
  google.maps.event.addListener(map, 'zoom_changed', function() {
    updateEdge();
    boxIn();
  });

  google.maps.event.addListener(map, 'center_changed', function() {
    boxIn();
  });

  
}

// Normalizes the coords that tiles repeat across the x axis (horizontally)
// like the standard Google map tiles.
function getNormalizedCoord(coord, zoom) {
  var y = coord.y;
  var x = coord.x;

  // tile range in one direction range is dependent on zoom level
  // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
  var tileRange = 1 << zoom;

  // don't repeat across y-axis (vertically)
  if (y < 0 || y >= tileRange) {
    return null;
  }


  if (x < 0 || x >= tileRange) {
    // ORIGINAL LINE to repeat across x-axis
    // x = (x % tileRange + tileRange) % tileRange;

    // in reality, do not want repeated tiles
    return null;
  }

  return {
    x: x,
    y: y
  };
}


google.maps.event.addDomListener(window, 'load', initialize);
