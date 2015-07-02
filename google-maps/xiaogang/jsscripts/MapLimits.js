"use strict";

var TILE_SIZE = 256;

function radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
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

function midpointLat(map) {
  var tileFactor = 1 << map.getZoom();
  var divHeight = document.getElementById("map_canvas_1").clientHeight;
  var midpointFromTop = divHeight / tileFactor / 2;
  return fromPointToLatLng(new google.maps.Point(0, midpointFromTop)).lat();
}

function getAllowedBounds(map) {
  var bounds = map.getBounds();
  
  var sw = bounds.getSouthWest();
  var ne = bounds.getNorthEast();

  var swLng = sw.lng();
  var swLat = sw.lat();

  var neLng = ne.lng();
  var neLat = ne.lat();
  
  if (swLng > neLng) {
    swLng -= 360;
  } 
  var width = neLng - swLng;
  
  var left = Math.min(-180+(width/2),-0.000001);
  var right = Math.max(180-(width/2),0.000001);

  var divHeight = document.getElementById("map_canvas_1").clientHeight;
  
  var divCenterLat = fromPointToLatLng(new google.maps.Point(0, divHeight)).lat();
  var currentZoom = map.getZoom();

  var top = midpointLat(map);
  var bottom = -midpointLat(map);
  
  var allowedBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(bottom,left),
    new google.maps.LatLng(top,right));

  return allowedBounds;
}

function boxIn(map, allowedBounds) {
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
