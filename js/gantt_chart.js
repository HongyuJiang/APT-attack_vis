function createGanttChart(nodesDict, dateDict){
	
	let width = 1100
	
	let height = 300
	
	let margin = 50
	
	const div = d3
	  .select('body')
	  .append('div')
	  .attr('class', 'tooltip')
	  .style('opacity', 0);
	
	const svg = d3.select('#timeline')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		
	defs = svg.append("defs")
	
	defs.append("marker")
	.attr("id","arrow2")
	.attr("viewBox","0 -5 10 10")
	.attr("refX",5)
	.attr("refY",0)
	.attr("markerWidth",4)
	.attr("markerHeight",4)
	.attr("orient","auto")
	.append("path")
	.attr("d", "M0,-5 L10,0 L0,5")
	.attr("fill", "black")
	.attr("class","arrowHead");
	
	let nodes = d3.keys(nodesDict)
	
	console.log(nodes)
	
	let dates = d3.keys(dateDict).map(d => parseInt(d))
	
	let xScale = d3.scaleLinear()
	.domain(d3.extent(dates))
	.range([margin * 2.5, width - margin])
	
	let yScale = d3.scalePoint()
	.domain(nodes)
	.range([margin, height - margin])
	
	xAxis = g => g
		.attr("transform", `translate(0,${height - 25})`)
		.call(d3.axisBottom(xScale))
	
	yAxis = g => g
		.attr("transform", `translate(110,0)`)
		.call(d3.axisLeft(yScale))
		.call(g => g.select(".domain").remove())
	  
	svg.append("g")
	    .call(xAxis);
	
		
	svg.append("g")
	    .call(yAxis);
		
	svg.append("g")
	.attr("class", "brush")
	.call(d3.brushX()
	    .extent([[0, margin], [width, height - margin/2]])
	    .on("end", brushended));
	
	let curveGenerator = d3.line()
	.curve(d3.curveBasis)
	.x(d => d.x)
	.y(d => d.y)

	for (let date in dateDict){
		
		date = parseInt(date)
		
		let links = dateDict[date]
		
		let linksDict = {}
		
		links.forEach(function(link){
			
			let key = link.source + '|' + link.target
			
			if (linksDict[key] == undefined){		
				linksDict[key] = []
			}
			
			linksDict[key].push({'sourcePort':link.sourcePort, 'targetPort':link.targetPort,'service':link.service})
		})
		
		for(let linkName in linksDict){
			
			let nodes = linkName.split('|')
			
			let source = nodes[0]
			
			let target = nodes[1]
			
			let y1 = yScale(source)
			
			let y2 = (yScale(source) + yScale(target)) / 2
			
			let y3 = yScale(target)
			
			let curveDegree = Math.abs(y1 - y2)
			
			let offset = curveDegree/5
			
			if(y1 > y2) offset = -offset

			let x1 = xScale(date)
			
			let x2 = xScale(date) + offset
			
			let x3 = xScale(date)
			
			let points = [{'x':x1,'y':y1},{'x':x2,'y':y2},{'x':x3,'y':y3}];
			
			let portsInfo = linksDict[linkName]
			
			let udpCounter = 0
			
			let tcpCounter = 0
			
			let sourcePorts = []
			
			let targetPorts = []
			
			let pairs = []
			
			portsInfo.forEach(function(d){
				
				pairs.push(d.sourcePort + '->' + d.targetPort)
				
				sourcePorts.push(d.sourcePort)
				
				targetPorts.push(d.targetPort)
				
				if (d.service == 'udp')	udpCounter += 1
				else  tcpCounter += 1
			})
			
			let totalCounter = udpCounter + tcpCounter
			
			let udpColor = [163,161,168]
			
			let tcpColor = [255,140,100]
			
			let mixedColor_r = (udpCounter * udpColor[0] + tcpCounter * tcpColor[0]) / totalCounter
			let mixedColor_g = (udpCounter * udpColor[1] + tcpCounter * tcpColor[1]) / totalCounter
			let mixedColor_b = (udpCounter * udpColor[2] + tcpCounter * tcpColor[2]) / totalCounter
			
			let mixedColor = d3.rgb(mixedColor_r, mixedColor_g, mixedColor_b)
			
			let portString = ''
			
			pairs.forEach(function(pair){
				
				portString = portString + pair + '</br></br>'
			})
		
			svg.append('path')
			.datum(points)
			.attr('d', curveGenerator)
			.attr('class','connection')
			.attr('stroke', 'black')
			.attr('opacity', '0.5')
			.attr('stroke-width', '2px')
			.attr('fill','none')
			.attr("marker-end", "url(#arrow2)")
			.attr('stroke', mixedColor)
			.attr('x', x1)
			.attr('date', date)
			
			svg.append('circle')
			.attr('cx', xScale(date))
			.attr('cy', yScale(source))
			.attr('r', 3)
			.attr('fill', 'grey')
			.on('mouseover', function(d){
				
			  div
				.transition()
				.duration(200)
				.style('opacity', 0.9);

			  div
				.html(portString)
				.style('left', d3.event.pageX + 'px')
				.style('height', pairs.length * 30)
				.style('top', d3.event.pageY - 28 + 'px');
			})
			.on('mouseout', () => {
				
			  div
				.transition()
				.duration(500)
				.style('opacity', 0);
			});
			
			//let port 
		}
		
	}	
	
	function brushended() {
		
		let focus = []
		
		if (!d3.event.sourceEvent) return; // Only transition after input
		if (!d3.event.selection) return; // Ignore empty selections.
		var d0 = d3.event.selection;
		
		svg.selectAll('.connection')
		.attr('opacity', function(d){
			
			let pos_x = parseFloat(d3.select(this).attr('x'))
			
			let date = parseInt(d3.select(this).attr('date'))
			
			if(pos_x <= d0[1] && pos_x >= d0[0]){
				focus.push(date)
				return '1'
			}
			else
				return '0.3'
		})
		
		console.log(focus)
	
		filterGroupNetwork(focus)
		
	}
	
	
	function filterGroupNetwork(dateGroup){
		
		let port_service = {}
		
		d3.selectAll('.link')
			.attr('opacity', 0)
		
		d3.selectAll('.node')
			.attr('opacity', 0)
			
		d3.select('#container').selectAll('.linkLabel').remove()
		d3.select('#container').selectAll('.linkPrefix').remove()
			
		dateGroup.forEach(function(d){
			
			let stamp = d
				
			dateDict[stamp].forEach(function(d){
				
				let sourceName = 'N' + d.source.replace(/\./g,'+')
				let targetName = 'N' + d.target.replace(/\./g,'+')
				
				let pathName = sourceName + '-' + targetName
				
				let pathSelector = '[id="' + pathName + '"]'
				
				d3.select(pathSelector).attr('opacity', 1)
				
				d3.select('[id="' + sourceName + '"]').attr('opacity', 1)
				
				d3.select('[id="' + targetName + '"]').attr('opacity', 1)
				
				let name = d.sourcePort + ',' + d.targetPort + ',' + d.service
				
				if (port_service[targetName] != undefined){
					
					if(port_service[targetName][name] != undefined){
						
						port_service[targetName][name] += 1
					}
					else{
						
						port_service[targetName][name] = 1
					}
				}
				else{
					
					port_service[targetName] = {}
					port_service[targetName][name] = 1
					
				}
						
			})
	
		})
		
		for(let target in port_service){
			
			let target_position = d3.select('[id="' + target + '"]').attr('transform')
			
			let index = 2
			
			for (let link in port_service[target]){
				
				index += 1
				
				d3.select('#container').select('svg')
					.append('text')
					.attr('class','linkLabel')
					.attr('transform', target_position)
					.attr('y', index * 18)
					.attr('x', -50)
					.attr('font-size', 12)
					.text(link.replace(',',' -> ').split(',')[0])
					
				d3.select('#container').select('svg')
					.append('rect')
					.attr('class','linkPrefix')
					.attr('transform', target_position)
					.attr('y', index * 18 + 2)
					.attr('x', -50)
					.attr('width', 30)
					.attr('height', 3)
					.attr('fill', link.split(',')[2] == 'udp' ? '#A3A1A8' : '#FF8C64')
					
				
			}
		}
		
	}
	
}