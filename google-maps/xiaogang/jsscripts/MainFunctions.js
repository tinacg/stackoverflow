var ImageTimeArray = [];  
var ImageStrArray = [];
var ImageCounter = 0;
var overlay_opacity = 0.6;
var overlay_mask_dropdown = new Array();

var ImageLoadedBoolean;
var day;
var daycount;
var gaugen; //Declare the gauge number as a global variable.
var gauge_area;
var gauge_lat;
var gauge_lon;
var image_type; //Determines what type of gauge plot one is looking at (wb or ds)
var wb_image_string; //water balance plot image string
var ds_image_string; //discharge plot image string
var wb_data_string; //water balance data string
var ds_data_string; //discharge data string
var sm_image_string; //soil moisture plot image string
var month;
var timestep_flag = 1; //flag to indicate whether we are working with daily or monthly time steps
timecount = 0;
var variable_image_number = 999; //Number that tells which overlay to animate
var t;
var myVariable;
var previous;
// function update_animation()
// (1) Clears all existing animations
// (2) Loads new animations based on (a) which radio button is checked, and (b) the timestamp form
// Called on the following events:
// (1) Initial page load (whichever dataset is checked by default)
// (2) When the selected radio button changes
// (3) When the timestamp form "update" button is clicked
function update_animation()
{
  clear_image_overlays();
  ReadTimeInterval();
  var dataset = $("ul.datalist>li>ul.dropdown-menu>li.active").find("a").attr('id');

  if(!(typeof dataset === "undefined")) {
    //Fill up the Array of image strings
    ImageTimeArray[dataset] = new Array();
    ImageStrArray[dataset] = new Array();

    if(data_dates_are_valid()) {
      ImageArrayPrep(ImageStrArray[dataset], ImageTimeArray[dataset]);
      display_colorbar(dataset);

      var time_delay = 1000*1/frames_per_second;

      overlay_obj[dataset] = new ImageOverlay(bounds, ImageStrArray[dataset][0], map_array[0], dataset);
      ImageCounter = 0;
      ChangeTimeStamp(1, ImageCounter, dataset);
      $( "#slider-date" ).html( ImageTimeArray[dataset][0] );
      ImageCounter = 1;
      
      // Make sure the play/pause icons are visible and set to "pause" when the animation starts
      $( "#slider-div").show();
      if($("#pause-or-continue").hasClass("icon-play"))
      {
        $("#pause-or-continue").removeClass("icon-play");
        $("#pause-or-continue").addClass("icon-pause");
      }

      // Set up the slider for this date range
      $(function() {
        $( "#animation-slider" ).slider({
          value:0,
          min: 0,
          max: ImageStrArray[dataset].length-1,
          step: 1,
          disabled: false,
          slide: function( event, ui ) {
            if($("#pause-or-continue").hasClass("icon-pause")) // if playing
              clearInterval(t);
            ImageCounter = ui.value;
            $( "#slider-date" ).html( ImageTimeArray[dataset][ImageCounter] );
            next_image();
            
            if($("#pause-or-continue").hasClass("icon-pause")) // if playing
              t = setInterval(next_image, 1000*1/frames_per_second);
          }
        });
      });

      t = setInterval(next_image, time_delay);
    }
    else { // Error
      clear_all_overlays();
      // Turn off the active chosen datasets
      $("ul.datalist>li").removeClass("active");
      $("ul.datalist>li>ul.dropdown-menu>li").removeClass("active");
      $("ul.datalist>li>a>i").removeClass("icon-ok");
      $("ul.datalist>li>ul.dropdown-menu>li>a>i").removeClass("icon-ok");
      alert(TRANSLATE["Error: "] + data_titles[dataset] + TRANSLATE[" is only available from "] + data_idates[dataset] + TRANSLATE[" to "] + data_fdates[dataset] + ".");
    }
  }
}

function update_basic()
{
  clear_image_overlays();  //Need to add condition for basic 
  ReadTimeInterval();      //Shouldn't need extra condition - but check
  var dataset = $("ul.datalist>li>ul.dropdown-menu>li.active").find("a").attr('id');

  if(!(typeof dataset === "undefined")) {
    //Fill up the Array of image strings
    ImageTimeArray[dataset] = new Array();
    ImageStrArray[dataset] = new Array();

    if(data_dates_are_valid()) {
      ImageArrayPrep(ImageStrArray[dataset], ImageTimeArray[dataset]);  

      var time_delay = 1000*1/frames_per_second;

      var div = document.createElement("div");
      div.style.position = "absolute";
      div.style.left = "0%";
      div.style.top = "0%";
      div.style.right = "0%";
      div.style.bottom = "0%";
      div.setAttribute('id','basic_image');
      
      var img = document.createElement("img");
      img.setAttribute('id',dataset);
      img.src = ImageStrArray[dataset][0];
      img.onerror = function (evt){
  	this.src = 'icons/gm_noimage.gif';
      }
      //img.style.width = "75%";
      //img.style.height = "75%";
      img.style.position = "absolute";
      img.style.left = "16%";
      img.style.top = "70px";
      div.appendChild(img);
      
      /*
      var titlediv = document.createElement("div");
      titlediv.setAttribute('class',"image_superposition");
      var titletext = document.createElement("h3");
      titletext.setAttribute('class',"text_superposition");
      titletext.innerHTML = dataset;
      titlediv.appendChild(titletext);
      div.appendChild(titlediv);
      */
      document.getElementById("basic_interface1").appendChild(div)

      ImageCounter = 0;
      ChangeTimeStamp(1, ImageCounter, dataset);  //Edit
      $( "#slider-date" ).html( ImageTimeArray[dataset][0] );
      ImageCounter = 1;
      
      // Make sure the play/pause icons are visible and set to "pause" when the animation starts
      $( "#slider-div").show();
      if($( "#pause-or-continue").hasClass("icon-play"))
      {
        $("#pause-or-continue").removeClass("icon-play");
        $("#pause-or-continue").addClass("icon-pause");
      }

      // Set up the slider for this date range
      $(function() {
        $( "#animation-slider" ).slider({
          value:0,
          min: 0,
          max: ImageStrArray[dataset].length-1,
          step: 1,
          disabled: false,
          slide: function( event, ui ) {
            if($("#pause-or-continue").hasClass("icon-pause")) // if playing
              clearInterval(t);
            ImageCounter = ui.value;
            $( "#slider-date" ).html(ImageTimeArray[dataset][ImageCounter] );
            next_image();  //edit
            
            if($("#pause-or-continue").hasClass("icon-pause")) // if playing
              t = setInterval(next_image, 1000*1/frames_per_second); //edit
          }
        });
      });

      t = setInterval(next_image, time_delay);
    }
    else { // Error
      clear_all_overlays();  //Edit
      // Turn off the active chosen datasets
      $("ul.datalist>li").removeClass("active");
      $("ul.datalist>li>ul.dropdown-menu>li").removeClass("active");
      $("ul.datalist>li>a>i").removeClass("icon-ok");
      $("ul.datalist>li>ul.dropdown-menu>li>a>i").removeClass("icon-ok");
      alert(TRANSLATE["Error: "] + data_titles[dataset] + TRANSLATE[" is only available from "] + data_idates[dataset] + TRANSLATE[" to "] + data_fdates[dataset] + ".");
      //alert("Error: Dataset " + dataset + " is only available from " + data_idates[dataset] + " to " + data_fdates[dataset] + ".");
    }
  }
}

function next_image()
{
  var dataset = $("ul.datalist>li>ul.dropdown-menu>li.active").find("a").attr('id');
  if (ImageCounter == ImageTimeArray[dataset].length) ImageCounter = 0;
  if ($("#InteractiveInterface").hasClass("active"))
    overlay_obj[dataset].swap(ImageStrArray[dataset][ImageCounter]);
  else
    $("#basic_image").find("img").attr('src', ImageStrArray[dataset][ImageCounter]);
  ChangeTimeStamp(2, ImageCounter, dataset);
  $( "#animation-slider" ).slider("option", "value", ImageCounter);
  $( "#slider-date" ).html( ImageTimeArray[dataset][ImageCounter] );
  ImageCounter += 1;
}

function clear_image_overlays()
{
  clearInterval(t);
  if ($("#InteractiveInterface").hasClass("active")) {
  for (var key in overlay_obj){
    if (overlay_obj[key] != undefined){
      overlay_obj[key].remove();
      delete overlay_obj[key];
      //Remove time stamp
      ChangeTimeStamp(3);
    }
  } }
  else {
    if (document.getElementById("basic_interface1").hasChildNodes()) {
      document.getElementById("basic_interface1").removeChild(document.getElementById("basic_image"));
    }
  }
  $("#Colorbar").css({visibility: "hidden", height: ""});
  $( "#animation-slider" ).slider("option", "disabled", true);
  $( "#animation-slider" ).slider("option", "value", 0);
  $( "#slider-date" ).html("");
  $( "#slider-div").hide();
}

function create_point_overlay() 
{
  var ds = "flw--ROUTING_VIC_3B42RT";
  var fdate = data_fdates[ds];
  // var imgpath = "../IMAGES/" + fdate + "/ROUTING_VIC_3B42RT/flw_" + fdate.replace(/\//g,'') + ".png";
  var imgpath = "http://stream.princeton.edu/GFDM/IMAGES/" + fdate + "/ROUTING_VIC_3B42RT/flw_" + fdate.replace(/\//g,'') + ".png";
  point_overlay = new ImageOverlay(bounds, imgpath, map_array[0], ds);
}

function clear_point_overlay()
{
  if(point_overlay != undefined) {
    point_overlay.remove();
    point_overlay = undefined;
  }
}

function display_colorbar(dataset)
{ 
  var dataset = dataset.split('--')[1] + '--' + dataset.split('--')[0]
  var current_timestep = $("ul.ts-selection li.active").attr('id').toUpperCase();
  var cbar_img = "../IMAGES/COLORBARS/" + dataset + "_" + current_timestep + ".png";
  $("#Colorbar").css({visibility: "visible", height: "52px"});
  $("#Colorbar").html("<img src=" + cbar_img + "></img>");
}

function imageLoaded()
{
  ImageLoadedBoolean = true;
}
  
function update_overlay(j) 
{
  var k;
  var cbar_string;  
  if (typeof static_overlay_obj[j] !="undefined") //hide the overlay
  {
    static_overlay_obj[j].remove();
    delete static_overlay_obj[j];
  }
  else if(typeof static_overlay_obj[j] == "undefined")
  {
    // grab overlay image select value
    value = document.getElementById("overlayImageSelect_" + j).value;
    // add new overlay to map
    static_overlay_obj[j] = new ImageOverlay(bounds, srcImage[j], map_array[0]);
  }
}

function update_overlay_opacity(flag_dir)
{
  var j = variable_image_number;
  var flag_dir
  if (flag_dir == 0){
    overlay_opacity = overlay_opacity - 0.2;
    if (overlay_opacity < 0){overlay_opacity = 0;};
  }
  else{
    overlay_opacity = overlay_opacity + 0.2;
    if (overlay_opacity > 1){overlay_opacity = 1;};
  }
  if (overlay_obj[j] != undefined){overlay_obj[j].ChangeOpacity();}
}
  
function clear_all_overlays()
{
  clear_image_overlays();

  //Clear all static overlays
  for (var k=0;k<static_overlay_obj.length;k++)
  {
    if (static_overlay_obj[k] != undefined)
    {
    clearTimeout(t);
    static_overlay_obj[k].remove();
    delete static_overlay_obj[k];
    }
  }

  // Clear all forms
  //document.getElementById("AnimationForm").reset();
  //$(".data-radio").prop('checked', false);
}

function ChangeLanguage(language)
{
  var locale_val;
  if(language == 'English') {locale_val = escape('en');}
  else if (language == 'French') { locale_val = escape('fr');}
  else if (language == 'Chinese') { locale_val = escape('cn');}
  else if (language == 'Spanish') { locale_val = escape('sp');}
  else if (language == 'Arabic') { locale_val = escape('ar');}

  var uri = window.location.toString().split('?');
  if (uri.length > 1) {
    var kvp = uri[1].split('&');
    var i=kvp.length; var x; while(i--) 
    {
      x = kvp[i].split('=');
      if (x[0]=='locale')
      {
        x[1] = locale_val;
        kvp[i] = x.join('=');
        break;
      }
    }
    if(i<0) {
      kvp[kvp.length] = ['locale',locale_val].join('=');
    }
    window.location.replace(uri[0]+'?'+kvp.join('&'));
  }
  else {
    window.location.replace(uri[0]+'?locale='+locale_val);
  }
}

function update_monitor_or_forecast()
{
  var morf = $("ul.monitor-or-forecast>li.active").find("a").attr('id');
  var current_setting = $("ul.data-extraction li.active>a").attr('id');

  if(""+morf == "monitor") {

    $("#Animation-Sidebar>div.dummy").show();
    $("li#Forecast").parent().hide();
    $("#Spatial-Sidebar>div.dummy").show();
    $("li#Forecast_spatial").parent().hide();

    $("#final-date-inputs").show();
    $("#initial-date-inputs").show();
    $("#Animation-Update").show();
    var sample_dataset = 'vcpct--VIC_DERIVED';
    var final_date = new Date(data_fdates[sample_dataset]);
    $("#year_initial").val(final_date.getFullYear());
    $("#month_initial").val(final_date.getMonth() + 1);
    $("#day_initial").val(final_date.getDate());
    $("#year_final").val(final_date.getFullYear());
    $("#month_final").val(final_date.getMonth() + 1);
    $("#day_final").val(final_date.getDate());
    $("#yearly").show();
  }
  else {

    $("#Animation-Sidebar>div.dummy").hide();
    $("li#Forecast").parent().show();
    $("#Spatial-Sidebar>div.dummy").hide();
    $("li#Forecast_spatial").parent().show();

    $("#initial-date-inputs").hide();
    $("#final-date-inputs").hide();
    $("#Animation-Update").hide();
    $("#yearly").hide();
    //Set the date to the latest forecast
    ReadTimeInterval();
  }

  // If we're in spatial mode switching between monitor/forecast, clear the "currently selected" list.
  if(""+current_setting == "spatial") {
    $("ul#currently-selected-vars>li>a").each(function() {
      $("ul.spatial-datalist>li>ul.dropdown-menu>li>a#" + $(this).attr('id')).parent().show();
      $(this).parent().remove();
      Update_Spatial_Data_Display();
    });
  }
}

function LoadBasic()
{ 
  //Hide gmaps interface and elements of sidebar
  //Alter nav bar to show the correct link
  if (!$("#BasicInterface").hasClass("active")) {
    if ($("#pointpill").hasClass("active")) {
    	Hide_Data_Extraction_Popup();
    }
    if ($("#feedbackBtn").hasClass("active")) {
      clearPopup();
    }
    $("#map_canvas_1").hide();
    $("#Colorbar").hide();
    $("#TimeStamp").hide();
    $("#InteractiveInterface").removeClass("active");
    $("#BasicInterface").addClass("active");
    $("#pointpill").css("visibility","hidden");
    $("#spatialpill").css("visibility","hidden");
    $("#basic_interface1").css("visibility","visible");
    $("#basic_interface1").css("overflow-x","scroll");
    $("#basic_interface1").css("overflow-y","scroll");
    $("#none").click();
    update_basic();

   }
}

function LoadInteractive()
{ 
  //Show gmaps interface and elements of sidebar
  //Alter nav bar to show the correct link
  if (!$("#InteractiveInterface").hasClass("active")) {
    if ($("#feedbackBtn").hasClass("active")) {
      clearPopup();
    }
    $("#map_canvas_1").show();
    google.maps.event.trigger(map_array[0], "resize");
    $("#Colorbar").show();
    $("#TimeStamp").show();
    $("#InteractiveInterface").addClass("active");
    $("#BasicInterface").removeClass("active");
    $("#pointpill").css("visibility","visible");
    $("#spatialpill").css("visibility","visible");
    $("#basic_interface1").css("visibility", "hidden");
    $("#basic_interface1").css("overflow-x","hidden");
    $("#basic_interface1").css("overflow-y","hidden");
    update_animation();
  }
}

function LoadFeedback()
{
  if (!$("#feedbackBtn").hasClass("active")) {
    $("#feedbackPopup").css("visibility","visible");
    
    if ($("#InteractiveInterface").hasClass("active")) {
      $("#InteractiveInterface").removeClass("active");
      previous = "#InteractiveInterface"; }
    else if ($("#BasicInterface").hasClass("active")) {
      $("#BasicInterface").removeClass("active");
      previous = "#BasicInterface"; }
    $("#feedbackBtn").addClass("active");

    // Bind submission event
    $("#feedbackForm").submit(function(e) {
      e.preventDefault();

      $.ajax({
        type:"post",
        url: 'scripts/send_feedback_email.php',
        data: $(this).serialize(),
        // Show a spinner here while request is sending.
        // beforeSend: function() {$("#ajax_request_load").show();},
        success: function(response){
          clearPopup();
        },
        async: true,
        cache: false
      });

    });
  }
}

function clearPopup() {
    $("#feedbackPopup").css("visibility","hidden");
    $("#feedbackBtn").removeClass("active");
    $(previous).addClass("active");
    $( "#feedbackForm" ).unbind("submit");
}
