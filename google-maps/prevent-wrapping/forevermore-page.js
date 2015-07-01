GEvent.addListener(
  map,
  "move",
  function() { checkBounds(); }
);

function checkBounds() {
  // Get some info about the current state of the map
  var C   = map.getCenter();
  var lng = C.lng();
  var lat = C.lat();
  var B  = map.getBounds();
  var sw = B.getSouthWest();
  var ne = B.getNorthEast();
  // Figure out if the image is outside of the artificial boundaries
  // created by our custom projection object.
  var new_lat = lat;
  var new_lng = lng;
  if (sw.lat() < -50) {
    new_lat = lat - (sw.lat() + 50);
  }
  else if (ne.lat() > 50) {
    new_lat = lat - (ne.lat() - 50);
  }
  if (sw.lng() < -50) {
    new_lng = lng - (sw.lng() + 50);
  }
  else if (ne.lng() > 50) {
    new_lng = lng - (ne.lng() - 50);
  }
  // If necessary, move the map
  if (new_lat != lat || new_lng != lng) {
    map.setCenter(new GLatLng(new_lat,new_lng));
  }
}

proj.fromPixelToLatLng = function(pixel, zoom, unbounded) {
  var max = Math.pow(2,zoom)*256;
  var lng = -(pixel.x / max) * 100 + 50;
  var lat = (pixel.y / max) * 100 - 50;
  return new GLatLng(lat, lng, unbounded);
}
proj.fromLatLngToPixel = function(latlng, zoom) {
  var max = Math.pow(2,zoom)*256;
  var x = -max * ((latlng.lng() - 50) / 100);
  var y = max * ((latlng.lat() + 50) / 100);
  return new GPoint(x, y);
}
