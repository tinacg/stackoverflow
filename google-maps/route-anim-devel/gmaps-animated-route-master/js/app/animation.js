define(['gmaps'],function(gmaps){
  var animationIndex = 0;

  function animateRoute(coords, map, line, animationIndex, globalState) {
    animationIndex = animationIndex || 0;
    
    if (animationIndex === 0) {
      clearInterval(interval);
    }
      
    var self = this,
        step = 0,
        numSteps = 40,
        animationSpeed = 0.50,
        offset = animationIndex,
    nextOffset = animationIndex + 1,
    // remove line initialization
    departure, destination, nextStop; //, interval;
    var interval;
    
    console.log(nextOffset);
    console.log(globalState.running);
    globalState.currentCoord = nextOffset;

    globalState.idle = false;
    
    if (nextOffset >= coords.length) {
      clearInterval(interval);
      globalState.idle = true;
      return false;
    }

    departure = coords[offset];
    destination = coords[nextOffset];

    line.segments.push(new gmaps.Polyline({
      path: [departure, departure],
      geodesic: false,
      strokeColor: '#f1d32e',
      strokeOpacity: 1,
      strokeWeight: 2,
      map: map
    }));

    globalState.running = true;
    
    interval = setInterval(function() {
      step++;
      if (step > numSteps) {
        animationIndex++;
        animateRoute(coords, map, line, animationIndex, globalState);
        clearInterval(interval);
        globalState.running = false;
      } else {
        nextStop = gmaps.geometry.spherical.interpolate(departure,destination,step/numSteps);
        line.segments[line.segments.length-1].setPath([departure, nextStop]);
      }
    }, animationSpeed);

  }

  return animateRoute;
});
