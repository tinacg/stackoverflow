function Update_Static_Images()
	{
	//Read the updated time
	var timestamp_year = parseInt(document.forms["TimeForm"]["latest_year"].value);
        var timestamp_month = parseInt(document.forms["TimeForm"]["latest_month"].value);
        var timestamp_day = parseInt(document.forms["TimeForm"]["latest_day"].value);
	if (timestamp_year <= 2008){Time_Period = "Historical";}
	else if (timestamp_year < 2011){Time_Period = "Catch_up";}
        else if (timestamp_year == 2011 && timestamp_month <= 9){Time_Period = "Catch_up";}
	else {Time_Period = "Realtime";}

	//Update the images
	var timestamp = sprintf("%04d",timestamp_year) + sprintf("%02d",timestamp_month) + sprintf("%02d",timestamp_day);
	var timestamp_str = sprintf("%02d",timestamp_day) + "/" + sprintf("%02d",timestamp_month) + "/" + sprintf("%04d",timestamp_year);
	var timestamp_str1 = sprintf("%04d",timestamp_year) + "/" + sprintf("%02d",timestamp_month) + "/" + sprintf("%02d",timestamp_day);

	document.getElementById("SMQALL").src =  ""
        document.getElementById("PREC").src =  "../IMAGES/"+timestamp_str1+"/PGF_prec_"+timestamp+".png"; 
        document.getElementById("EVAP").src =  "Data/ADM_Data/" + Time_Period + "/evap_basic/evap_" + timestamp + ".png"; 
        document.getElementById("GAUGES_PERCENTILES").src = "Data/ADM_Data/" + Time_Period + "/gaugepct_basic/gaugepct_" + timestamp + ".png"; 
        document.getElementById("SMWET1").src = "Data/ADM_Data/" + Time_Period + "/smwet1_basic/smwet1_" + timestamp + ".png"; 
        document.getElementById("SMWET2").src = "Data/ADM_Data/" + Time_Period + "/smwet2_basic/smwet2_" + timestamp + ".png"; 
        document.getElementById("RUNOFF").src = "Data/ADM_Data/" + Time_Period + "/runoff_basic/runoff_" + timestamp + ".png"; 
        document.getElementById("TMAX").src = "Data/ADM_Data/" + Time_Period + "/tmax_basic/tmax_" + timestamp + ".png"; 
        document.getElementById("TMIN").src = "Data/ADM_Data/" + Time_Period + "/tmin_basic/tmin_" + timestamp + ".png"; 
        document.getElementById("WIND").src = "Data/ADM_Data/" + Time_Period + "/wind_basic/wind_" + timestamp + ".png"; 
        document.getElementById("Drought_Conditions").innerHTML = "Drought Conditions on " + timestamp_str;
	}

function Update_Static_Images_Step(flag_arrow)
	{
	var flag_arrow;
	var newtimestamp = new Array(3);
	//Read the current time
	var timestamp_year = parseInt(document.forms["TimeForm"]["latest_year"].value);
        var timestamp_month = parseInt(document.forms["TimeForm"]["latest_month"].value);
        var timestamp_day = parseInt(document.forms["TimeForm"]["latest_day"].value);
	var date_temp = new Date(timestamp_year,timestamp_month-1,timestamp_day);
	//Find the next or previous timestamp
	if (flag_arrow == 1)
		{
		date_temp.setDate(date_temp.getDate() + 1);
		newtimestamp = [date_temp.getFullYear(),date_temp.getMonth() + 1,date_temp.getDate()];
		}
	else 
		{
                date_temp.setDate(date_temp.getDate() - 1);
                newtimestamp = [date_temp.getFullYear(),date_temp.getMonth() + 1,date_temp.getDate()];
		}
	//Update the time string
	if (newtimestamp[0] <= 2008){Time_Period = "Historical";}
        else if (newtimestamp[0] < 2011){Time_Period = "Catch_up";}
        else if (newtimestamp[0] == 2011 && newtimestamp[1] <= 9){Time_Period = "Catch_up";}
        else {Time_Period = "Realtime";}
	document.forms["TimeForm"]["latest_year"].value = newtimestamp[0];
	document.forms["TimeForm"]["latest_month"].value = newtimestamp[1];
	document.forms["TimeForm"]["latest_day"].value = newtimestamp[2];
	var timestamp = sprintf("%04d",newtimestamp[0]) + sprintf("%02d",newtimestamp[1]) + sprintf("%02d",newtimestamp[2]);
        var timestamp_str = sprintf("%02d",newtimestamp[2]) + "/" + sprintf("%02d",newtimestamp[1]) + "/" + sprintf("%04d",newtimestamp[0]);
        document.getElementById("SMQALL").src = "Data/ADM_Data/" + Time_Period + "/smqall_basic/smqall_" + timestamp + ".png";
        document.getElementById("PREC").src =  "Data/ADM_Data/" + Time_Period + "/prec_basic/prec_" + timestamp + ".png";
        document.getElementById("EVAP").src =  "Data/ADM_Data/" + Time_Period + "/evap_basic/evap_" + timestamp + ".png";
        document.getElementById("GAUGES_PERCENTILES").src = "Data/ADM_Data/" + Time_Period + "/gaugepct_basic/gaugepct_" + timestamp + ".png";
        document.getElementById("SMWET1").src = "Data/ADM_Data/" + Time_Period + "/smwet1_basic/smwet1_" + timestamp + ".png";  
        document.getElementById("SMWET2").src = "Data/ADM_Data/" + Time_Period + "/smwet2_basic/smwet2_" + timestamp + ".png";  
        document.getElementById("RUNOFF").src = "Data/ADM_Data/" + Time_Period + "/runoff_basic/runoff_" + timestamp + ".png";  
        document.getElementById("TMAX").src = "Data/ADM_Data/" + Time_Period + "/tmax_basic/tmax_" + timestamp + ".png";    
        document.getElementById("TMIN").src = "Data/ADM_Data/" + Time_Period + "/tmin_basic/tmin_" + timestamp + ".png";     
        document.getElementById("WIND").src = "Data/ADM_Data/" + Time_Period + "/wind_basic/wind_" + timestamp + ".png";    
        document.getElementById("Drought_Conditions").innerHTML = "Drought Conditions on " + timestamp_str;
	}
	//

