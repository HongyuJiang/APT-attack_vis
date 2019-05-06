function createPortsChart(data, divID){
	
	d3.select(divID).selectAll('*').remove()
	
	let ports_data = []
	
	let role = 'asDes'
	
	if(d3.keys(data['asSrc']).length > d3.keys(data['asDes']).length){
		
		role = 'asSrc'
	}
	
	for(let port in data[role]){
		
		ports_data.push({'port': parseInt(port), 'value': data[role][port], 'group': parseInt(port / 10000)})
	}
	
	console.log(ports_data)
	
	var width = 500,
      height = 500,
      start = 0,
      end = Math.PI,
      numSpirals = 3
      margin = {top:50,bottom:50,left:50,right:50};

    var theta = function(r) {
      return numSpirals * Math.PI * r;
    };

    // used to assign nodes color by group
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var r = d3.min([width, height]) / 2 - 40;

    var radius = d3.scaleLinear()
      .domain([start, end])
      .range([40, r]);

    var svg = d3.select(divID).append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.left + margin.right)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var points = d3.range(start, end + 0.001, (end - start) / 1000);

    var spiral = d3.radialLine()
      .curve(d3.curveCardinal)
      .angle(theta)
      .radius(radius);

    var path = svg.append("path")
      .datum(points)
      .attr("id", "spiral")
      .attr("d", spiral)
      .style("fill", "#ccc")
	  .style("fill-opacity", 0.1)
      .style("stroke", "#666")
	  .style("stroke-opacity", 0.5)
	  .style("stroke-width", 3);

    var spiralLength = path.node().getTotalLength(),
        N = 365,
        barWidth = (spiralLength / N / 2) - 1;
	
    var portScale = d3.scaleLinear()
      .domain(d3.extent(ports_data, d => d.port))
      .range([0, spiralLength]);
    
    // yScale for the bar height
    var yScale = d3.scaleLinear()
      .domain([0, d3.max(ports_data, function(d){
        return d.value;
      })])
      .range([0, (r / numSpirals) - 40]);

    svg.selectAll("rect")
      .data(ports_data)
      .enter()
      .append("rect")
      .attr("x", function(d,i){
        
        var linePer = portScale(d.port),
            posOnLine = path.node().getPointAtLength(linePer),
            angleOnLine = path.node().getPointAtLength(linePer - barWidth);
      
        d.linePer = linePer; // % distance are on the spiral
        d.x = posOnLine.x; // x postion on the spiral
        d.y = posOnLine.y; // y position on the spiral
        
        d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

        return d.x;
      })
      .attr("y", function(d){
        return d.y;
      })
      .attr("width", function(d){
        return barWidth;
      })
      .attr("height", function(d){
        return yScale(d.value);
      })
      .style("fill", '#FF8C64')
      .style("stroke", "none")
      .attr("transform", function(d){
        return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
      });
	  
	  let minPort = d3.min(ports_data, d => d.port)
	  
	  let maxPort = d3.max(ports_data, d => d.port)
	  
	  let labelData = []
    
	
	for(let i=minPort;i <= maxPort; i += parseInt((maxPort-minPort)/12) ){
		
		labelData.push({'port': i})
		
	}
  
    svg.selectAll("text")
      .data(labelData)
      .enter()
      .append("text")
      .attr("dy", 10)
      .style("text-anchor", "start")
      .style("font", "10px arial")
      .append("textPath")
      // only add for the first of each month
      .text(function(d){
        return d.port;
      })
      // place text along spiral
      .attr("xlink:href", "#spiral")
      .style("fill", "grey")
      .attr("startOffset", function(d){
        return ((portScale(d.port) / spiralLength) * 100) + "%";
      })


    var tooltip = d3.select(divID)
    .append('div')
    .attr('class', 'tooltip');

    tooltip.append('div')
    .attr('class', 'date');
    tooltip.append('div')
    .attr('class', 'value');

    svg.selectAll("rect")
    .on('mouseover', function(d) {

        tooltip.select('.date').html("Date: <b>" + d.port + "</b>");
        tooltip.select('.value').html("Value: <b>" + Math.round(d.value*100)/100 + "<b>");

        d3.select(this)
        .style("fill","#FFFFFF")
        .style("stroke","#000000")
        .style("stroke-width","2px");

        tooltip.style('display', 'block');
        tooltip.style('opacity',2);

    })
    .on('mousemove', function(d) {
        tooltip.style('top', (d3.event.layerY + 10) + 'px')
        .style('left', (d3.event.layerX - 25) + 'px');
    })
    .on('mouseout', function(d) {
        svg.selectAll("rect")
        .style("fill", '#FF8C64')
        .style("stroke", "none")

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });
}