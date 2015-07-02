"use strict";

// observations
//
// map does wrap around at longitudes +/-180; however, tile display can be
// manipulated to only show up once.
//
// markers placed around longiudes +/-180 will show up twice. Not sure how to
// prevent this.

var divHeight = document.getElementById("map-canvas").clientHeight;

var TILE_SIZE = 256;

var map;
var allowedBounds;

var bounds;
var sw;
var ne;
var width;
var height;

// https://developers.google.com/maps/documentation/javascript/examples/map-coordinates

function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
}

function bound(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}

function fromLatLngToPoint(latLng, map) {
  var point = new google.maps.Point(0, 0);
  var origin = new google.maps.Point(TILE_SIZE/2, TILE_SIZE/2);

  var pixelsPerLonDegree_ = TILE_SIZE / 360;
  var pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);

  point.x = origin.x + latLng.lng() * pixelsPerLonDegree_;

  // Truncating to 0.9999 effectively limits latitude to 89.189. This is
  // about a third of a tile past the edge of the world tile.
  var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999,
                   0.9999);
  point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) *
    -pixelsPerLonRadian_;
  return point;
}

function fromPointToLatLng(point) {
  // value from 0 to 256
  var pixelOrigin_ = new google.maps.Point(TILE_SIZE / 2,
                                           TILE_SIZE / 2);
  var origin = new google.maps.Point(TILE_SIZE/2, TILE_SIZE/2);

  var pixelsPerLonDegree_ = TILE_SIZE / 360;
  var pixelsPerLonRadian_ = TILE_SIZE / (2 * Math.PI);

  var origin = pixelOrigin_;
  var lng = (point.x - origin.x) / pixelsPerLonDegree_;
  var latRadians = (point.y - origin.y) / -pixelsPerLonRadian_;
  var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) -
                             Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};

function midpointLat() {
  var tileFactor = 1 << map.getZoom();
  var midpointFromTop = divHeight / tileFactor / 2;
  return fromPointToLatLng(new google.maps.Point(0, midpointFromTop)).lat();
}

function addMarker(lat, lng) {
  new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
  }).setMap(map);
}

function addIcon(lat, lng, url) {
  new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    icon: url,
  }).setMap(map);
}

function updateEdge() {
  bounds = map.getBounds();
  
  sw = bounds.getSouthWest();
  ne = bounds.getNorthEast();

  var swLng = sw.lng();
  var swLat = sw.lat();

  var neLng = ne.lng();
  var neLat = ne.lat();
  
  if (swLng > neLng) {
    swLng -= 360;
  } 
  width = neLng - swLng;
  
  var left = Math.min(-180+(width/2),-0.000001);
  var right = Math.max(180-(width/2),0.000001);
  
  var divCenterLat = fromPointToLatLng(new google.maps.Point(0, divHeight)).lat();
  var currentZoom = map.getZoom();

  var top = midpointLat();
  var bottom = -midpointLat();
  
  allowedBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(bottom,left),
    new google.maps.LatLng(top,right));

}

function boxIn() {
  if (allowedBounds.contains(map.getCenter())) {
    return;
  } else {
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

    map.panTo(new google.maps.LatLng(Y, X));
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
  radius: 100,
  name: 'Moon'
};

var moonMapType = new google.maps.ImageMapType(moonTypeOptions);


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

function initialize() {
  var myLatlng = new google.maps.LatLng(0, 0);
  var mapOptions = {
    center: myLatlng,
    zoom: 1,
    // streetViewControl: false,
    disableDefaultUI: true,
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

  google.maps.event.addListener(map, 'click', function(e) {
    console.log("map clicked at: " + e.latLng.lat() + "," + e.latLng.lng());
  });

  updateEdge();

  addIcon(0, 0, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=O|00FF00|000000");

  addIcon(85.1, 179, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=TR|00FF00|000000");

  addIcon(-85.1, -179, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=BL|00FF00|000000");

  addIcon(20.1, 9, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=2|00FF00|000000");
  addIcon(40.1, 9, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=4|00FF00|000000");
  addIcon(60.1, 9, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=6|00FF00|000000");
  addIcon(80.1, 9, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=8|00FF00|000000");
  addIcon(85.1, 9, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=8|00FF00|000000");
  addIcon(-85.1, 9, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=8|00FF00|000000");

  addIcon(60.1, -179, "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Y|00FF00|000000");
}

google.maps.event.addDomListener(window, 'load', initialize);
