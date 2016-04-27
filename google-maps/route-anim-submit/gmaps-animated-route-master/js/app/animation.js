define(['gmaps'],function(gmaps){
  var animationIndex = 0;

  function animateRoute(coords, map, line, animationIndex, globalState) {

    // ADD, to make redraw possible
    animationIndex = animationIndex || 0;

    var self = this,
    step = 0,
    numSteps = 20,
    animationSpeed = 0.50,
    offset = animationIndex,
    nextOffset = animationIndex + 1,
    departure, destination, nextStop, line, interval;

    // ADD
    globalState.idle = false;

    console.log("animation offset " + nextOffset);
    
    if (nextOffset >= coords.length) {
      clearInterval(interval);
      globalState.idle = true;
      return false;
    }

    departure = coords[offset];
    destination = coords[nextOffset];

    // ADD
    line.segments.push(new gmaps.Polyline({
      path: [departure, departure],
      geodesic: false,
      strokeColor: '#f1d32e',
      strokeOpacity: 1,
      strokeWeight: 2,
      map: map
      
      // ADD RIGHT PARENTHESES
    }));

    interval = setInterval(function() {
      step++;
      if (step > numSteps) {
        animationIndex++;

        // ADD references to globals
        animateRoute(coords, map, line, animationIndex, globalState);
        clearInterval(interval);
      } else {
        nextStop = gmaps.geometry.spherical.interpolate(departure,destination,step/numSteps);
        // ADD segment reference
        line.segments[line.segments.length-1].setPath([departure, nextStop]);
      }
    }, animationSpeed);
  }

  return animateRoute;
});
