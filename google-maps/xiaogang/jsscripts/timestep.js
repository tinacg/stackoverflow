function update_timestep()
{
  var idate = new Date(parseInt($("#year_initial").val()),parseInt($("#month_initial").val())-1,parseInt($("#day_initial").val()));
  var fdate = new Date(parseInt($("#year_final").val()),parseInt($("#month_final").val())-1,parseInt($("#day_final").val()));
  var morf = $("ul.monitor-or-forecast>li.active").find("a").attr('id');
  var current_timestep = $("ul.ts-selection li.active").attr('id');
  var abbrevs = {"daily": "D", "monthly": "M", "yearly": "Y"};
  var anim_string, spatial_string;
  for(dataset in data_timesteps) {
    anim_string = "ul.datalist>li>ul.dropdown-menu>li>a#" + dataset;
    spatial_string = "ul.spatial-datalist>li>ul.dropdown-menu>li>a#" + dataset;
    $(anim_string + "," + spatial_string).each(function() {
      if(data_timesteps[dataset].indexOf(abbrevs[current_timestep]) == -1) {
        $(this).parent().hide(150, function() {});
        $(this).parent().removeClass("visible-data");

        if($(this).parent().hasClass("active")) {
          $(this).parent().removeClass("active");
         $(this).parent().parent().parent().removeClass("active");
          $(this).parent().parent().parent().find("a.dropdown-toggle>i").removeClass("icon-ok");
          $(this).find('i').removeClass("icon-ok");
        }
      }
      else {
        $(this).parent().show(150, function() {});
        $(this).parent().addClass("visible-data");
        var nav_header_id = $(this).parent().parent().parent().parent().parent().siblings(".nav-header").attr('id');
        if (nav_header_id != 'Forecast' && nav_header_id != 'Forecast_spatial'){
         if (Date.parse(data_fdates[dataset]).valueOf() >= fdate.valueOf() && Date.parse(data_idates[dataset]).valueOf() <= idate.valueOf())
          $(this).css("background-color","rgba(194, 238, 194, 0.0)")
         if (Date.parse(data_fdates[dataset]).valueOf() < fdate.valueOf() || Date.parse(data_idates[dataset]).valueOf() > idate.valueOf())
          $(this).css("background-color","rgba(250, 158, 158, 0.2")
        }
      }
    });
  }

  // Disable/Enable the relevant timestamp input boxes depending which radio button is selected
  if(""+current_timestep == "daily")
    $("input[id='day_initial'], input[id='day_final']").show(150, function() {});
  else
    $("input[id='day_initial'], input[id='day_final']").hide(150, function() {});

  if(""+current_timestep == "yearly")
    $("input[id='month_initial'], input[id='month_final']").hide(150, function() {});
  else
    $("input[id='month_initial'], input[id='month_final']").show(150, function() {});

  // loop through dropdown list and hide anything with no dropdown links
  $("ul.datalist>li,ul.spatial-datalist>li").each(function(index) {
    if($(this).find("ul.dropdown-menu>li.visible-data").length == 0) {
      $(this).hide(150, function() {});
    } else {
      $(this).show(150, function() {});
    }
  });

  // If selecting spatial data, update the "estimated download size" display
  //if("spatial" == $("ul.data-extraction li.active>a").attr('id'))
  //    Update_Spatial_Data_Display();
      //Remove all the selections
  if("spatial" == $("ul.data-extraction li.active>a").attr('id')){
    $("ul#currently-selected-vars>li>a").each(function() {
    $("ul.spatial-datalist>li>ul.dropdown-menu>li>a#" + $(this).attr('id')).parent().show();
    $(this).parent().remove();
    Update_Spatial_Data_Display();
    });
  }
}

function Update_TimeStamp_MP(increment, flag_timestamp)
{
  var current_timestep = $("ul.ts-selection li.active").attr('id');
  var date_temp, i_or_f;

  var initial_date = new Date(parseInt($("#year_initial").val()),
                           parseInt($("#month_initial").val())-1,
                           parseInt($("#day_initial").val()));
  var final_date = new Date(parseInt($("#year_final").val()),
                           parseInt($("#month_final").val())-1,
                           parseInt($("#day_final").val()));

  if (flag_timestamp == 0) {
    date_temp = initial_date;
    i_or_f = "initial";
  }
  else {
    date_temp = final_date;
    i_or_f = "final";
  }

  //Find the next or previous timestamp
  if(""+current_timestep == "daily")
    date_temp.setDate(date_temp.getDate() + increment);
  else if(""+current_timestep == "monthly")
    date_temp.setMonth(date_temp.getMonth() + increment); // will loop around 12 automatically
  else 
    date_temp.setFullYear(date_temp.getFullYear() + increment);
  
  var morf = $("ul.monitor-or-forecast>li.active").find("a").attr('id');
  if (flag_timestamp == 0 && increment == 1 && date_temp.valueOf() > final_date.valueOf()) {
    if(""+morf == "monitor") return;
  }
  else if (flag_timestamp == 1 && increment == -1 && date_temp.valueOf() < initial_date.valueOf()) return;

  // Update the time string
  $("#year_" + i_or_f).val(date_temp.getFullYear());
  $("#month_" + i_or_f).val(date_temp.getMonth() + 1);
  $("#day_" + i_or_f).val(date_temp.getDate());

  // If selecting spatial data, update the "estimated download size" display
  if("spatial" == $("ul.data-extraction li.active>a").attr('id'))
      Update_Spatial_Data_Display();
}

function data_dates_are_valid()
{
  var dataset = $("ul.datalist>li>ul.dropdown-menu>li.active").find("a").attr('id');
  var initial_date = new Date(parseInt($("#year_initial").val()),
                           parseInt($("#month_initial").val())-1,
                           parseInt($("#day_initial").val()));
  var final_date = new Date(parseInt($("#year_final").val()),
                           parseInt($("#month_final").val())-1,
                           parseInt($("#day_final").val()));

  if(Date.parse(data_idates[dataset]).valueOf() <= initial_date.valueOf()
  && Date.parse(data_fdates[dataset]).valueOf() >= final_date.valueOf())
    return true;
  else return false; 
}

function data_dates_are_valid_basic(dataset)
{
  var current_date = new Date(parseInt(document.getElementById('year_latest').value),
                           parseInt(document.getElementById('month_latest').value)-1,
                           parseInt(document.getElementById('day_latest').value));

  if(Date.parse(data_idates[dataset]).valueOf() <= current_date.valueOf() && Date.parse(data_fdates[dataset]).valueOf() >= current_date.valueOf())
    return true;
  else return false;
}


