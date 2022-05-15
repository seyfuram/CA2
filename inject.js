var x1=-1182680.379684;
var x2=-654340.977579;
var y1=6692550.958911;
var y2=7437174.761476;

var xdef=2412.54370492
var ydef=2981.0441028
  
  var box=[];
  
  for(var i=x1;i<=(x2+xdef);i+=xdef)
  {
	for(var j=y1;j<=(y2+ydef);j+=ydef)
	{
		box.push(i+","+j+","+(i+xdef)+","+(j+ydef));
	}
  }
  window.scraper={};
  window.scraper.box=box;
  //$("title").html("Progress: "+(100/box.length*0)+"%");
  
  var cols=["Accident Id","Coordinates","Severity","Year","Vehicle","Circumstances","Day of week","Time","Speedlimit","Casualties - Fatal","Casualties - Serious","Casualties - Minor","Casualties - Total"];
  
  
  
  var collisionTypes =  {"0": "All", "1": "Fatal", "2": "Serious", "3": "Minor"};
  var dayOfWeek= {"1": "Sunday", "2": "Monday", "3": "Tuesday", "4": "Wednesday", "5": "Thursday", "6": "Friday", "7": "Saturday"};
  var hours = {"1": "0700-1000", "2": "1000-1600", "3": "1600-1900", "4": "1900-2300", "5": "2300-0300", "6": "0300-0700"};
  var hoursLong = {"1": "7am to 10am", "2": "10am to 4pm", "3": "4pm to 7pm", "4": "7pm to 11pm", "5": "11pm to 3am", "6": "3am to 7am"};
  var primaryCollisionType = {"1": "Pedestrian", "2": "Single vehicle only", "3": "Head-on conflict", "4": "Head-on right turn", "5": "Angle, both straight", "6": "Angle, right turn", "7": "Rear end, straight", "8": "Rear end, right turn", "9": "Rear end, left turn", "10": "Other"};
  var types = {"0": "All", "1": "Pedestrian", "2": "Bicycle", "3": "Motorcycle", "4": "Car", "5": "Goods vehicle", "6": "Bus", "7": "Other"};
  var vehicleTypes = {"1": "Bicycle", "2": "Motorcycle", "3": "Car", "4": "Goods vehicle", "5": "Bus", "6": "Other"};
  
  var datas=[cols];
  window.scraper.datas=datas;
  function parse_xml(data)
  {
	var o=$(data);
	var members=$("gml\\:featureMember",o);
	
	for(var i=0;i<members.length;i++)
	{
		var member=members.eq(i);
		var accident_id=$("fs\\:nraincidents",member).attr("fid");
		var coordinates=JSON.stringify($("gml\\:coordinates",member).html());
		var Severity=collisionTypes[$("fs\\:type",member).html()];
		var Year=parseInt($("fs\\:year",member).html(), 10) + 2000;
		var temp2 = "";
		if($("fs\\:class1",member).html() != "" && parseInt($("fs\\:class1",member).html()) < 7)
		{
			temp2=vehicleTypes[$("fs\\:class1",member).html()];//+" - "+$("fs\\:class1",member).html();
		}
		var Vehicle=temp2;
		var temp = "Unknown";
		if(primaryCollisionType[$("fs\\:prcoltyp",member).html()] !== undefined) {
			temp = primaryCollisionType[$("fs\\:prcoltyp",member).html()];
		}		
		var Circumstances=JSON.stringify(temp);
		var Dayofweek=dayOfWeek[$("fs\\:weekday",member).html()];
		var Time=hoursLong[$("fs\\:hour",member).html()];
		var Speedlimit=$("fs\\:splimit",member).html();
		var casualties_fatal=parseInt($("fs\\:no_fatal",member).html(), 10);
		var casualties_serious=parseInt($("fs\\:no_serious",member).html(), 10);
		var casualties_minor=parseInt($("fs\\:no_minor",member).html(), 10);
		var casualties_total=casualties_fatal+casualties_serious+casualties_minor;

		
			
		datas.push([accident_id,coordinates,Severity,Year,Vehicle,Circumstances,Dayofweek,Time,Speedlimit,casualties_fatal,casualties_serious,casualties_minor,casualties_total]);
		
	}
	console.log(members.length);
  }
  var process_count=0;
  
  
  function scrap_cell(num,end)
  {
	var url="https://public.healthatlasireland.ie/featureserver_testrsa/featureserver.cgi/nraincidents?format=WFS&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&vehicle=0&queryable=&SRS=EPSG%3A900913&YEAR=0&TYPE=0&BBOX="+box[num];
	
	$.get(url,function(data,status){
		process_count++;
		window.scraper.process_count=process_count;
		//$("title").html("Progress: "+(100/box.length*process_count)+"%");
		//console.log(data);
		result=parse_xml(data);
		console.log(datas.length);
		//console.log(result);
		
		num++;
		if(num<end)
		{
			scrap_cell(num,end);
			window.scraper.datas=datas;
		}
	});
  }
  
  //scrap_cell(0,100);
  //scrap_cell(100,200);
  //scrap_cell(200,300);
  scrap_cell(0,12000);
  scrap_cell(12000,24000);
  scrap_cell(24000,36000);
  scrap_cell(36000,48000);
  scrap_cell(48000,box.length);
  
  return true;
