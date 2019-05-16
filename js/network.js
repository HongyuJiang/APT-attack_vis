function createNetwork(linksDict, nodesDict, portsDict){
	
	let data = {'links':[],'nodes':[]};
				
	for (let source in linksDict){
			
		for (let target in linksDict[source]){
				
			let weight = linksDict[source][target]
				
			let link = {'source':source,'target':target, 'weight':weight};
				
			data['links'].push(link)
		}
	}
		
		
		
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
	
	defs = svg.append("defs")
	
	defs.append("marker")
	.attr("id","arrow")
	.attr("viewBox","0 -5 10 10")
	.attr("refX",5)
	.attr("refY",0)
	.attr("markerWidth",4)
	.attr("markerHeight",4)
	.attr("orient","auto")
	.append("path")
	.attr("d", "M0,-5 L10,0 L0,5")
	.attr("fill", "#ccc")
	.attr("class","arrowHead");
	
	
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
			.attr('class','link')
		  .attr("marker-mid", "url(#arrow)")
	    .attr("stroke-width", d => Math.sqrt(d.weight))
		  .attr('fill','none')
	
	const node = svg.append("g")
	    .attr("stroke", "#fff")
	    .attr("stroke-width", 1.5)
	    .selectAll("node")
	    .data(nodes)
	    .join("g")
	    .attr('class','node')
	    .attr("id", d => 'N' + d.id.replace(/\./g,'+'))
	    .on('click', function(d){
				
	        createPortsChart(portsDict[d.id], '#ports')
	    })
			
	node.append('circle')
	    .attr("r", 10)
	    .attr("fill", '#999')
		  .attr('cx', 0)
		  .attr('cy', 0)
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
	
}