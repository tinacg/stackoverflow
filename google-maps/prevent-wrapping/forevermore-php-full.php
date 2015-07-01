/**
 * Tutorial for using the Google Maps API to zoom photos.
 *
 * Article Text is copyright 2008 to Chris Petersen, and may not be copied
 * or reproduced without permission.
 *
 * Code samples are copyright 2008 to Chris Petersen and iFloor.com, except
 * where Google API licensing might require other attribution.  You are,
 * however, more than welcome to use the code samples and techniques described
 * in this article within your own photo zoom application, provided that you
 * provide proper attribution, and your application does not violate Google's
 * own Terms of Use:  http://www.google.com/intl/en_us/help/terms_maps.html
 *
 * @copyright   Chris Petersen
 * @package     forevermore.net
 *
/**/

// Which section are we in?
    $Nav = 'misc';

// Init
    require_once dirname($_SERVER['DOCUMENT_ROOT']).'/includes/init.php';

// My Google Maps API key.  Go get your own:  http://code.google.com/apis/maps/signup.html
    $api_key = 'ABQIAAAAyZat92QkGrgik62MqAtmKRSSC1bCAaIjLz7Q0k2UBDPY5gAtmxTn-6pNf2O8xMBkDxhVT68rg09g1g';

// Images that you have to choose from on my system
    $images = array(
        'milan'       => 'Milan Duomo roof',
        'paris'       => 'Paris at night',
        'ravenna'     => 'Ravenna mosaic',
        'sanchapelle' => 'Sainte Chapelle chapel',
        'venice'      => 'Venice twilight',
        'venus'       => 'Venus statue'
        );

// Don't let someone try to hack your system by passing in a path like /etc/passwd
    if (!$images[$_REQUEST['img']]) {
        $_REQUEST['img'] = 'paris';
    }

// None of my images have a zoom level greater than 5, so we start here.
    $max_zoom = 5;

// Make sure that the max zoom setting is valid for this image, by checking
// to see if the zoom tile directory exists for this level.  If not, drop down
// a level and check again.
    while (!is_dir("tiles/".$_REQUEST['img']."/$max_zoom")) {
        $max_zoom--;
    }

// Some error occurred
    if ($max_zoom < 1) {
        print "No zoom level found for image: ".$_REQUEST['img'];
        exit;
    }

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Using Google Maps to zoom photos</title>
    <link rel="stylesheet" type="text/css" href="imagezoom.css">
    <link rel="stylesheet" type="text/css" href="/<?php echo svn_rev ?>/css/site.css">
    <!--[if lte IE 6]><link rel="stylesheet" type="text/css" href="/css/ie6.css"><![endif]-->
    <!--[if IE]><link rel="stylesheet" type="text/css" href="/css/ie.css" /><![endif]-->
    <link rel="stylesheet" type="text/css" href="/<?php echo svn_rev ?>/css/print.css" media="print">
    <script type="text/javascript" src="http://www.google.com/jsapi?key=<?php echo $api_key ?>"></script>
    <script type="text/javascript">
//<![CDATA[

// Load our favorite javascript libraries
    google.load("prototype", "1.6");
    google.load("maps", "2");

// Image base, for URL generation
    var img_base = '<?php echo $_REQUEST['img'] ?>';

    function load() {

    // Incompatible browser
        if (!GBrowserIsCompatible()) {
            alert("Sorry, the Google Maps API used for this image zoom demo is not compatible with this browser.");
            return;
        }

    // Create the map
        var map = new GMap(document.getElementById("map"));
        map.addControl(new GLargeMapControl());

    // You could enable scroll wheel zooming here.  Unfortunately, I found that
    // interacted strangely with the normal scroll bar on this page, so I have
    // disabled it for this demo.  I would only advise enabling this feature
    // if your viewer page is of fixed dimensions and does not scroll.
        //map.enableScrollWheelZoom();

    // Custom tile URL
        myTileURL=function(p,z){
            return "tiles/"+img_base+"/"+z+"/"+p.x+"-"+p.y+".jpg";
        }

     // Create and load new copyright data for this site
        var copyright = new GCopyrightCollection('');
        copyright.addCopyright(
            new GCopyright(1,
                new GLatLngBounds(
                    new GLatLng(0,0),
                    new GLatLng(0,0)
                    ),
                1,
                "&copy; forevermore.net"
                )
            );

    // Create a new projection so we can control the wrap functionality and
    // prevent the map from wrapping the image at the X axis.
    // Code taken from the example here:
    // http://groups.google.com/group/Google-Maps-API/browse_thread/thread/16777e5a58ce37a1
        var proj = new GMercatorProjection(<?php echo $max_zoom ?>);
        proj.tileCheckRange = function(p,z,s) {
                if (p.y < 0 || p.x < 0) {
                    return false;
                }
                var max=Math.pow(2,z);
                if (p.y >= max || p.x >= max){
                    return false;
                }
                return true;
            }
        // Custom coordinate handlers force the image to appear within +-50 lat
        // and lng so that we can easily prevent people from dragging the image
        // outside of its boundaries.
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

    // Prevent people from scrolling outside the boundaries of our image

        // Add a move listener to restrict the bounds range
        GEvent.addListener(
            map,
            "move",
            function() {
                checkBounds();
            }
            );

        // If the map position is out of range, move it back
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

    // Create the tile later and apply it to the map
        var tilelayers = [new GTileLayer(copyright,1,<?php echo $max_zoom ?>)];
        tilelayers[0].getTileUrl = myTileURL;
        var tileMap = new GMapType(tilelayers, proj, 'Zoom');
        tileMap.getTextColor = function() {return "#005511";};

    // Activate the map with the custom tile layers
        map.addMapType(tileMap);
        map.setCenter(new GLatLng(0,0), 1, tileMap);
    }

    //]]>
    </script>
<?php
// Include my global site header
    require_once 'tmpl/menu.php';
?>
</head>

<body onload="load()" onunload="GUnload()">

<div id="article" class="inset">
    <div class="left">
        <div class="top"></div>
        <div class="middle">
            <div class="title"></div>

        </div>
        <div class="bottom"></div>
    </div>
    <div class="content">

<h1>Using the Google Maps API to zoom photographs</h1>

<p class="italic">
Please note that this is a fairly advanced exercise that requires at least
some understanding of Javascript and the Google Maps API.
</p>

<p>
I work for a well known retail/online
<a href="http://www.ifloor.com/">flooring store</a>, and was recently asked to
replace an antiquated (and defunct) image zoom application with something
cheaper and more reliable than its more modern replacement (which would cost
us thousands of dollars per month to license).  iFloor is known for having
extremely high resolution photographs of their products, and we needed new a
way to display them that was easy for customers to use, as well as light on
processing power and bandwidth, not to mention easy for developers and system
administrators to maintain.
</p>

<p>
I owe a great deal of thanks to <a href="http://www.ifloor.com/">iFloor</a> for
allowing me to publish this tutorial, so if you find this helpful, please
consider them the next time that you are in the market for new floors or an
area rug.
</p>

<p>
Being that I'm somewhat of an old-school web designer and don't like to rely on
Flash/SWF in web pages (although I'll happily admit that image zoom would be a
pretty good application for it), I immediately turned my attention to the
tile-based zoom techologies like <a href="http://maps.google.com">Google Maps</a>
and <a href="http://www.openlayers.org/">Open Layers</a>.  Having been given a
relatively short deadline, I wasn't about to write my own tile display engine
from scratch, and as much as I am a fan of
<a href="http://www.fsf.org/">Free Open Source software</a>, I decided to stick
with the commercially-backed and well-documented Google Maps API because it
would be easier for both myself and iFloor to maintain.
</p>

<div class="demo">
    <a name="zoom"></a>

    <form id="photochange" method="post" action="/articles/photo-zoom/#zoom">

    <p>
    View Image:
    <select name="img" onchange="$('photochange').submit()">
    <?php   foreach ($images as $img => $name) { ?>
        <option value="<?php echo $img ?>"<?php
            if ($img == $_REQUEST['img']) {
                echo ' selected="selected"';
            }
            ?>><?php echo htmlspecialchars($name) ?></option>
    <?php   } ?>
        </select>
    </p>

    </form>

    <div id="imagezoom">
        <div class="outer">
            <div class="inner">
                <div id="map" style="width: 512px; height: 340px;"></div>
            </div>
        </div>
    </div>
</div>

<hr />

<h3>Tiles:</h3>

<p>
The first problem to tackle is to create the tiles from your images.
Thankfully, this process is fairly well documented and there are at least half
a dozen or so scripts/websites scattered around the internet that will generate
them for you.  If you don't want to look for them, you can use
<a href="create_tiles.pl.txt">the one that I wrote</a>, which happens to output
a directory structure that matches the myTileURL() function described in this
tutorial.  It's pretty straighforward -- you just pass it an output directory
and list of images to slice up, and it does the rest of the work.  See the
--help option for more information.
</p>

<p>
For example, this is what I used to generate some of the image tiles used in
this demo:
</p>

<code>./create_tiles.pl -v --path tiles/ paris.jpg ravenna.jpg venus.jpg</code>

<p>
This created tiles/paris/, tiles/ravenna/, and tiles/venus/ directories, with
a tiles directory tree beneath them that matches the format expected by the
myTileURL() function that will be described below.
</p>

<p>
Keep in mind that the Maps API requires that your images be square, and fit
within 256 times some multiple of 2.  Before creating the tiles themselves, my
script will resize your image up to the next largest zoom level, and pad the
edges with black pixels to give you a square image.  This can occasionally make
the deepest zoom level a little fuzzy, but in my opinion, it's better than
preventing a full zoom level if your image is 2000x2000 instead of 2048x2048.
If you don't like this behavior, the code is well-documented and you should
only need basic knowledge of Perl in order to comment it out.
</p>

<p>
Then you just have to define a function to tell the Maps API where to find your
image tiles, and override the default getTileURL value in your GTileLayer
object:
</p>

<code>myTileURL=function(p,z){
    return "tiles/"+img_base+"/"+z+"/"+p.x+"-"+p.y+".jpg";
}
// ...
var tilelayers = [new GTileLayer(copyright,1,max_zoom];
tilelayers[0].getTileUrl = myTileURL;
</code>

<hr />

<h3>The Map Problem:</h3>

<p>
Google's instructions for
<a href="http://code.google.com/apis/maps/documentation/overlays.html#Custom_Map_Types">using custom map tiles</a>
are fairly straightforward, with one major caveat:  Google Maps was designed to
display maps, not photographs.  More specifically, it was designed to display 2
dimensional representations of a globe, which <b>wrap</b> when you scroll
around (also referred to as panning).
</p>

<p>
When I first started researching the idea of using the Maps API to display
zoomed versions of photographs, I needed to find a way to turn off this wrap
feature -- after all, photographs are.  This turned out to be significantly
more difficult than I initially expected, and is the primary reason that I have
taken the time to write this article.  There are two pieces to this puzzle.
</p>

<h3>Boundary Detection:</h3>

<p>
I can't take credit for the idea of creating a bounds-checking script.  There
have been several versions published, and all rely on a function that is
triggered whenever a &quot;move&quot; GEvent is detected.  My code looks
pretty much like this:
</p>

<code>GEvent.addListener(
    map,
    &quot;move&quot;,
    function() { checkBounds(); }
    );

function checkBounds() {
    // Read on for more about bounds checking...
}</code>

<p>
The idea is that the checkBounds() function will be called whenever the user
drags the map around.  You can then use checkBounds() to determine if the user
has dragged the &quot;map&quot; image outside of its boundaries, and if so,
reset things to put the viewport back within the expected minimum/maximum
coordinates.
</p>

<h3>Coordinates:</h3>

<p>
The problem with all of the bounds checking routines that I could find is that
they were heavily dependent on map coordinate systems, which are in turn
heavily dependent on both the zoom level, and Google's coordinate system, which
assumes that you're using Google's map images.  You can't just use pixel
coordinates to tell when you've reached the edge of your image because the Maps
API only wants to deal with map coordinates.  On top of this, when using custom
tiles, the coordinate system has a rather annoying default feature that wraps
lattitude and longitude coordinates at 90 and 180 degrees, respectively,
whenever the map is panned around past the parts of the image initially visible
in the viewspace.  This makes it incredibly difficult to determine exactly
where you are within your photograph, since the coordinates 50,50 appear many
times throughout the image at a high zoom level.
</p>

<p>
The few working examples I could find were either restricted to real-world map
coordinates (e.g. restricting viewers to a specific city for a mashup that only
had local data), or only worked for one or two zoom levels, which had custom
boundary detection routines for each zoom level.  Neither of these solutions
was acceptable to me.
</p>

<p>
After several frustrating re-reads of the documentation, I noticed the
fromPixelToLatLng() and fromLatLngToPixel() methods on the GMercatorProjection
class, which weren't really documented as well as other methods, but I figured
from the names that they might be useful to me.  Thankfully, they do exactly
what I hoped:  convert image pixel coordinates to lattitude and longitude
coordinates.
</p>

<p>
Since we don't care about lattitude and longitude in a photograph, I overloaded
these methods with two of my own creation, and inserted them into my proj
GProjection object.  In order to keep things simple (I like to think in terms
of percentages), I just assume that the coordinate boundaries are 100x100, no
matter how far in or out the user has zoomed.  In order to keep things
compatible with Google's behavior, I then shift things 50 degrees up and left
so that 0,0 represents the center of the image, and the boundaries are defined
at -50 and 50 on both the X and Y axes.
</p>

<code>proj.fromPixelToLatLng = function(pixel, zoom, unbounded) {
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
</code>

<p>
These routines do expect that your photos are square, and still let your
viewers drag the zoom images into the black padding areas created by the
create_tiles script.  It would be fairly simple to could be extend them further
to restrict the dragging to within the actual image boundaries, but that would
require keeping track of the ratio of the original image dimensions, and
somehow passing it into the javascript routine.  It would require keeping track
of the original image dimensions (among other things), which adds more complexity
than I wish to explain in this tutorial (or even set up on the iFloor website),
 so I have left off the feature.
</p>

<h3>Putting It Together:</h3>

<p>
Because the new coordinate system sets a hard boundary of plus or minus 50
degrees, no matter what the zoom level, there is no longer a need to create
a custom boundary checking routine for each zoom level, and it will always be
accurate for our photos, no matter what zoom level the user is viewing at.
</p>

<code>function checkBounds() {
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
}</code>

<p>
At this point, I won't bore you by pasting in more code that you can just see
by viewing the source for this page (or downloading the
<a href="index.phps">full php source</a>).  The rest of it is just the fairly
straightforward routine of creating and activating a GMap object, and then
attaching various site-specific customizations (e.g. a copyright notice), as
well as the custom tile and boundary handlers.  You will find the
well-documented javascript defined at the top.
</p>

<p>
If you don't like my demo photos at the top of the page, feel free to head over
to <a href="http://www.ifloor.com/">iFloor</a> and take a look at any of the
products that let you &quot;click to zoom&quot;.  Chances are that even the
small thumbnails for alternate views will bring up a full scale zoom image.
</p>

<hr>

<p class="italic">
Article Text is &copy;2008 to Chris Petersen, and may not be copied or
reproduced without permission.
</p>

<p class="italic">
Code samples are &copy;2008 to Chris Petersen and iFloor.com, except where
Google API licensing might require other attribution.  You are, however, more
than welcome to use the code samples and techniques described in this article
within your own photo zoom application, provided that you provide proper
attribution, and your application does not violate Google's own
<a href="http://www.google.com/intl/en_us/help/terms_maps.html">Terms of Use</a>.
</p>

</div><!-- .content -->
</div><!-- #article -->
