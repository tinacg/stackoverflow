//Define the objects
ImageOverlay.prototype = new google.maps.OverlayView();

//Define the functions
function ImageOverlay(bounds, image, map,id,flag_basin)
{
  var map;
  var flag_basin;
  this.bounds_ = bounds;
  this.image_ = image;
  this.map_ = map;
  this.div_ = null; 
  this.setMap(map);
  this.imageid_ = id;
  if (flag_basin == "undefined")
  {
    flag_basin = 0;
  }
  this.flag_basin = flag_basin;
}

ImageOverlay.prototype.onAdd = function() 
{
  var div = document.createElement('DIV');
  //img.setAttribute("id","nameba;hwskefbg");
  div.style.borderStyle = "none";
  div.style.borderWidth = "0px";
  div.style.position = "absolute";
  div.style.left = "520px";  // 200 px
  div.style.top="100px";
  //div.style.opacity = 0.8;
  var img = document.createElement("img");
  img.setAttribute('id',this.imageid_);
  img.src = this.image_;
  img.onerror = function (evt){
  	this.src = 'icons/gm_noimage.gif';
  }
  // img.style.width = "100%";
  img.style.width = "none";	// HEXG
  img.style.height = "100%";
  if (this.flag_basin == 1)
  {
    img.style.opacity = 0.2;
  }
  else
  {
  	img.style.opacity = overlay_opacity;//0.4;
  }
  div.appendChild(img);
  this.div_ = div;
  // this.img_ = img;
  var panes = this.getPanes();
  panes.overlayImage.appendChild(div);
}

ImageOverlay.prototype.ChangeOpacity = function()
{
  var img = document.getElementById(this.imageid_);
  img.style.opacity = overlay_opacity;
}


//ImageOverlay.prototype.draw = function() 
//{ 
//  var overlayProjection = this.getProjection();
//  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
//  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());
//  var div = this.div_;
//  div.style.left = sw.x + 'px';
//  div.style.top = ne.y + 'px';
//  div.style.width = (ne.x - sw.x) + 'px';
//  div.style.height = (sw.y - ne.y) + 'px';
//}

// Modified by HEXG
ImageOverlay.prototype.draw = function() 
{ 
  var overlayProjection = this.getProjection();
  var worldwidth = overlayProjection.getWorldWidth();

  // var prevX = null;
  var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
  var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

  /*
  if (prevX !=null) {
    // Check for a gigantic jump to prevent wrapping around the world
    var dist = sw.x - prevX;
    if (Math.abs(dist) > (worldwidth * 0.9)) {
      if (dist > 0) {
        sw.x -= worldwidth;
      } else {
        sw.x += worldwidth;
      }
    }
  }
 
  prevX = sw.x;
  */
  
  var div = this.div_;

  // Tina's hack
  var screenWidth = document.getElementById("map_canvas_1").clientWidth;

  // determine acceptable range for div.style.left  
  if (worldwidth > screenWidth) {
    while (sw.x > 0) {
      sw.x -= worldwidth;
    }
  } 

  // I ran into a case where sw.x was -2046 and worldwidth was 2048.
  // So only 2 pixels of the overlay were shown. This factor ensures
  // at least a meaningful percentage of the width will be covered
  var wiggleRoom = 0.9;

  while (sw.x < -(wiggleRoom * worldwidth)) {
    sw.x += worldwidth;
  }

  // console.log(sw.x);
  
  div.style.left = sw.x + 'px';
  
  div.style.top = ne.y + 'px';
  div.style.width = (ne.x - sw.x) + 'px';
  div.style.height = (sw.y - ne.y) + 'px';
}
// Modified by HEXG




ImageOverlay.prototype.onRemove = function() 
{
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
}

ImageOverlay.prototype.remove = function() 
{
  if (this.getMap()) 
  {
    this.setMap(null); 
    //replace color bar with white strip
  } 
  else 
  {
    this.setMap(this.map_);
    //replace color bar with new colorbar
  }
}

ImageOverlay.prototype.swap=function(image_str)
{
  img = document.getElementById(this.imageid_)
  var image_str;
  //img.addEvent('load',function(e){});
  img.src = image_str;
  //img.onload=imageLoaded();
  img.onerror = function (evt){
  	this.src = 'icons/gm_noimage.gif';
  }	
}
