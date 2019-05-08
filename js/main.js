d3.json("./data/mid-level-phase-3.json").then(function(dataset){
	
	let data = {'links':[],'nodes':[]};
	
	let statData = []
	
	let nodesDict = {};
	
	let linksDict = {};
	
	let portsDict = {};
	
	let datesDict = {};
	
	dataset['xml']['IDMEF-Message'].forEach(function(d){
		
		let date = new Date(d['Alert']['Time']['date'] + ' ' + d['Alert']['Time']['time'])
		
		let stamp =  d['Alert']['Time']['time'].split(':')[1] * 60 + parseInt(d['Alert']['Time']['time'].split(':')[2])
		
		let source = d['Alert']['Source']['Node']['Address']['address']
		
		let target = d['Alert']['Target']['Node']['Address']['address']
		
		let sourcePort = d['Alert']['Target']['Service']['sport']
		
		let descPort = d['Alert']['Target']['Service']['dport']
		
		let service = d['Alert']['Target']['Service']['name']
		
		if(linksDict[source] != undefined){
			
			if(linksDict[source][target] != undefined){
				
				linksDict[source][target] += 1
			}
			else{
				
				linksDict[source][target] = 1
			}
		}
		else{
			
			linksDict[source] = {}
			linksDict[source][target] = 1
		}
		
		if(portsDict[source] != undefined){
			
			if(portsDict[source]['asSrc'][sourcePort] != undefined){
				
				portsDict[source]['asSrc'][sourcePort] += 1
			}
			else{
				
				portsDict[source]['asSrc'][sourcePort] = 1
			}
		}
		else{
			
			portsDict[source] = {'asSrc':{}, 'asDes':{}},
			portsDict[source]['asSrc'][sourcePort] = 1
		}
		
		if(portsDict[target] != undefined){
			
			if(portsDict[target]['asDes'][descPort] != undefined){
				
				portsDict[target]['asDes'][descPort] += 1
			}
			else{
				
				portsDict[target]['asDes'][descPort] = 1
			}
		}
		else{
			
			portsDict[target] = {'asSrc':{}, 'asDes':{}},
			portsDict[target]['asDes'][descPort] = 1
		}
		
		if(datesDict[stamp] != undefined){
			
			datesDict[stamp].push({
				'source':source,'target':target, 
			  'targetPort':descPort,'sourcePort':sourcePort, 
				'service': service})
		}
		else{
			
			datesDict[stamp] = []
			
			datesDict[stamp].push({
				'source':source,'target':target, 
			  'targetPort':descPort,'sourcePort':sourcePort, 
				'service': service})
		}
		
		
		nodesDict[source] = 1
		
		nodesDict[target] = 1
		
		statData.push({'time': date,'service':service})
		

	})

			
	for (let source in linksDict){
		
		for (let target in linksDict[source]){
			
			let weight = linksDict[source][target]
			
			let link = {'source':source,'target':target, 'weight':weight};
			
			data['links'].push(link)
		}
	}
	
	createTimeline(statData)
	
	for(let key in nodesDict){
		
		data['nodes'].push({'id':key})
	}
	
	let height = 600
	let width = 600
	
	let scale = d3.scaleOrdinal(d3.schemeCategory10);
	
	let color = d => scale(d.group);
	
	let drag = simulation => {
	  
	  function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	  }
	  
	  function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	  }
	  
	  function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	  }
	  
	  return d3.drag()
		  .on("start", dragstarted)
		  .on("drag", dragged)
		  .on("end", dragended);
	}
	
  const links = data.links;
  const nodes = data.nodes;

  const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links)
		  .distance(function(d) {return 180;})
		  .id(d => d.id))
	  .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return 90; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

  const svg = d3.select('#container')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  
  /*let hexWidth = 50
  
  let hexHeight = hexWidth * 1.214
  
  let centerPoints = {'x':100,'y':100}
  
  function hexPolygon(center){
  	
  	let p1 = [center.x, center.y - hexHeight/2]
  	
  	let p2 = [center.x + hexWidth/2, center.y - hexHeight/4]
  	
  	let p3 = [center.x + hexWidth/2, center.y + hexHeight/4]
  	
  	let p4 = [center.x, center.y + hexHeight/2]
  	
  	let p5 = [center.x - hexWidth/2,center.y + hexHeight/4]
  	
  	let p6 = [center.x - hexWidth/2,center.y - hexHeight/4]
  	
  	let p7 = [center.x, center.y - hexHeight/2]
  	
  	let points = [p1,p2,p3,p4,p5,p6,p7]
  	
  	svg
  	.append("polygon")
  	.attr("points", points)
  	.attr("stroke", "white")
  	.attr("stroke-width", "2")
  	.attr("fill", "#b0e8f0");
  	
  }
  
  hexPolygon(centerPoints)*/

  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("path")
    .data(links)
    .join("path")
		.attr('id', function(d){
			
			
				let sourceName = 'N' + d.source.id.replace(/\./g,'+')
				let targetName = 'N' + d.target.id.replace(/\./g,'+')
				
				return sourceName + '-' + targetName
		})
      .attr("stroke-width", d => Math.sqrt(d.weight))
	  .attr('fill','none')

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("node")
    .data(nodes)
    .join("g")
		.attr("id", d => d.id.replace(/\./g,'+'))
	.on('click', function(d){
		
		createPortsChart(portsDict[d.id], '#ports')
	})
	
  node.append('circle')
      .attr("r", 10)
      .attr("fill", '#999')
      .call(drag(simulation));
	  
  node.append("text")
	  .attr('stroke', 'black')
	  .attr("font-weight", 100)
	  .attr("font-size", 11)
	  .attr("text-anchor", 'middle')
	  .attr("y", '20')
      .text(d => d.id);

  simulation.on("tick", () => {
    
	link.attr("d", function(d) {
		var dx = d.target.x - d.source.x,
			dy = d.target.y - d.source.y,
			dr = Math.sqrt(dx * dx + dy * dy);
		return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	});
	
    node
        .attr("transform", d => 'translate(' + d.x + ',' + d.y + ')')
				.attr("loc", d => d.x + ',' + d.y)
     
  });

  createAnimation(datesDict, svg)

})