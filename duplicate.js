  var clean=[];
  var datas=window.scraper.datas;
  for(var i=1;i<datas.length;i++)
  {
	var not_found=true;
	for(var j=0;j<clean.length;j++)
	{
		if(clean[j][0]==datas[i][0])
		{
			not_found=false;
			break;
		}
	}
	if(not_found)
	{
		clean.push(datas[i]);
	}
  }
  window.scraper.datas=[datas[0],...clean];
  return window.scraper.datas;