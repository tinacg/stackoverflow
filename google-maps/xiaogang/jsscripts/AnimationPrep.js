function ReadTimeInterval()
{
  year_initial = parseInt(document.forms["AnimationForm"]["year_initial"].value);
  year_final = parseInt(document.forms["AnimationForm"]["year_final"].value);
  month_initial = parseInt(document.forms["AnimationForm"]["month_initial"].value);
  month_final = parseInt(document.forms["AnimationForm"]["month_final"].value);
  day_initial = parseInt(document.forms["AnimationForm"]["day_initial"].value);
  day_final = parseInt(document.forms["AnimationForm"]["day_final"].value);
  
  // If in forecast mode, need to get a different final date for the animation
  var morf = $("ul.monitor-or-forecast>li.active").find("a").attr('id');
  if(""+morf == "forecast") {
    var forecast_days = 7-1;
    var forecast_months = 6-1; // 6 month forecast - includes current initial month

    var current_timestep = $("ul.ts-selection li.active").attr('id');
    var dataset = $("ul.datalist>li>ul.dropdown-menu>li.active").find("a").attr('id');
    if (current_timestep == 'daily') {
     var sample_dataset = "vcpct--GFS_7DAY_FORECAST";
    }
    else if (current_timestep == 'monthly') { 
     var sample_dataset = "prec--MultiModel";
    }
    var initial_date = new Date(data_idates[sample_dataset]);
    $("#year_initial").val(initial_date.getFullYear());
    $("#month_initial").val(initial_date.getMonth() + 1);
    $("#day_initial").val(initial_date.getDate());
    $("#year_final").val(initial_date.getFullYear());
    $("#month_final").val(initial_date.getMonth() + 1);
    $("#day_final").val(initial_date.getDate());
    //var initial_date = new Date(parseInt($("#year_initial").val()),
    //                      parseInt($("#month_initial").val())-1,
    //                       parseInt($("#day_initial").val()));
    var forecast_final_date = initial_date;

    if(""+current_timestep == "daily")
      forecast_final_date.setDate(initial_date.getDate() + forecast_days);
    else if(""+current_timestep == "monthly")
      forecast_final_date.setMonth(initial_date.getMonth() + forecast_months); // will loop around 12 automatically
    
    day_final = forecast_final_date.getDate();
    month_final = forecast_final_date.getMonth()+1;
    year_final = forecast_final_date.getFullYear();
  }
}

function ImageArrayPrep(ImageStrArray,ImageTimeArray)
{
  var current_timestep = $("ul.ts-selection li.active").attr('id');
  var dataset = $("ul.datalist>li>ul.dropdown-menu>li.active").find("a").attr('id');
  var initial_date = new Date(year_initial, month_initial-1, day_initial);
  var final_date = new Date(year_final, month_final-1, day_final);
  var date_temp = initial_date;
  var framect = 0;
  var Dstring, Mstring, Ystring, tstring, tstamp;
  // If in forecast mode, need to get a different URL for images
  var morf = $("ul.monitor-or-forecast>li.active").find("a").attr('id');
  var initDstring = sprintf("%02d",parseInt(initial_date.getDate())),
      initMstring = sprintf("%02d",parseInt(initial_date.getMonth()+1)),
      initYstring = sprintf("%02d", parseInt(initial_date.getFullYear()));

  // Example image urls:
  //../IMAGES/DAILY/19480101/PGF_prec_19480101_daily.svg
  //../IMAGES/MONTHLY/200212/...
  //../IMAGES/YEARLY/1948/...etc.

  while(date_temp.valueOf() <= final_date.valueOf())
  {
    Dstring = sprintf("%02d",parseInt(date_temp.getDate()));
    Mstring = sprintf("%02d",parseInt(date_temp.getMonth()+1));
    Ystring = sprintf("%02d", parseInt(date_temp.getFullYear()));

    if(""+current_timestep == "daily") {
      tstring = Ystring + Mstring + Dstring;
      tstamp = Ystring + "/" + Mstring + "/" + Dstring;
      date_temp.setDate(date_temp.getDate() + 1);

      if(""+morf == "monitor")
        dir_tstring = Ystring + '/' + Mstring + '/' + Dstring;
      else
        dir_tstring = initYstring + '/' + initMstring + '/' + initDstring;
    }
    else if(""+current_timestep == "monthly") {
      tstring = Ystring + Mstring;
      tstamp = Ystring + "/" + Mstring;
      date_temp.setMonth(date_temp.getMonth() + 1);

      if(""+morf == "monitor")
        dir_tstring = Ystring + '/' + Mstring;
      else
        dir_tstring = initYstring + '/' + initMstring;
    }
    else {
      tstring = Ystring;
      dir_tstring = Ystring;
      tstamp = Ystring;
      date_temp.setFullYear(date_temp.getFullYear() + 1);

      if(""+morf == "monitor")
        dir_tstring = Ystring;
      else
        dir_tstring = initYstring;
    }

    //ImageStrArray[framect] = "../IMAGES/" + current_timestep.toUpperCase() + "/" + tstring + "/" + dataset + "_" + tstring + ".png";
    //if(""+morf == "monitor")
    // ImageStrArray[framect] = "../IMAGES/" + dir_tstring + "/" + dataset + "_" + tstring + ".png";
    //else {
    //temp = dataset.split("-")
    variable = dataset.split("--")[0]//temp[temp.length-1]
    datadir = dataset.split("--")[1]//temp.slice(0,temp.length-1).join("_")
    
    if ($("#InteractiveInterface").hasClass("active"))
      ImageStrArray[framect] = "../IMAGES/" + dir_tstring + "/" + datadir + "/" + variable + "_" + tstring + ".png";
    else  //Change to correct path when processed!
      ImageStrArray[framect] = "../IMAGES/" + dir_tstring + "/" + datadir + "/" + variable + "_" + tstring + "_s.png";
    ImageTimeArray[framect] = tstamp;
    framect += 1;
  }

}

function ChangeTimeStamp(flag_time,i,j)
{
  obj = document.getElementById("TimeStamp").style;
  //Option 1: Add time stamp to map
  if (flag_time == 1)
  {
    obj.visibility = "visible";
    obj.height = "100";
    contentString = "<h2>" + ImageTimeArray[j][""+i] + "</h2>";
    //contentString = "<div>" + ImageTimeArray[j][i] + "</div>";
    document.getElementById('TimeStamp').innerHTML = contentString;
  }
  //Option 2: Update time stamp on map
  if (flag_time == 2)
  {
    contentString = "<h2>" + ImageTimeArray[j][""+i] + "</h2>";;
    //contentString = "<div>" + ImageTimeArray[j][i] + "</div>";
    document.getElementById('TimeStamp').innerHTML = contentString;
  }
  //Option 3: Remove time stamp form map
  if (flag_time == 3)
  {
    obj.visibility = "hidden";
    obj.height = "";
  }
}
