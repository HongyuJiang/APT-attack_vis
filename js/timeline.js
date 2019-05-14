function createTimeline(dataset, dateDict){
	
	
	let bins = {}
	
	dataset.forEach(function(d){
		
		let service = d.service
		let time_key = d.time.getMinutes() + 'M-' + d.time.getSeconds()
		
		if(bins[time_key] != undefined){
			
			if (bins[time_key][service] != undefined){
				
				bins[time_key][service] += 1
				bins[time_key]['counter'] += 1
			} 
			else{
				
				bins[time_key][service] = 1
				bins[time_key]['counter'] += 1
			}
		} 
		else{
			
			bins[time_key] = {}
			bins[time_key][service] = 1
			bins[time_key]['counter'] = 1
		}
		
	})
	
	let bins_list = []
	
	for (let key in bins){
		
		let meta = bins[key]
		
		bins_list.push({'key':key,'stats':meta})
	}

	
	let height = 300
	let width = 1100
	
	let margin = ({top: 20, right: 0, bottom: 30, left: 40})
	
	x = d3.scaleBand()
		.domain(bins_list.map(d => d.key))
		.range([margin.left, width - margin.right])
		.padding(0.2)
	
	y = d3.scaleLinear()
		.domain([0, d3.max(bins_list, d => d.stats.counter)]).nice()
		.range([height - margin.bottom, margin.top])
	
	const svg = d3.select('#timeline')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
	  
	let rectGroup = svg.selectAll('rectGroup')
		.data(bins_list)
		.enter()
		.append("g")
		.on('click', function(d){
			
			let date = d.key
			
			console.log(date)
			
			let data_arr = date.split('M-')
			
			let stamp = '' + (data_arr[0] * 60 + parseInt(data_arr[1]))
			
			console.log(dateDict[stamp])
			
			d3.selectAll('.link')
				.attr('opacity', 0)
				
			let port_service = {}
				
			dateDict[stamp].forEach(function(d){
				
				let sourceName = 'N' + d.source.replace(/\./g,'+')
				let targetName = 'N' + d.target.replace(/\./g,'+')
				
				let pathName = sourceName + '-' + targetName
				
				let pathSelector = '[id="' + pathName + '"]'
				
				d3.select(pathSelector).attr('opacity', 1)
				
				let name = d.sourcePort + ',' + d.targetPort
				
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
				
				
				d3.select('#container').selectAll('.linkLabel').remove()
				
				
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
						.text(link.replace(',',' -> '))
						
					}
				}
				
		
			})
			
				
		})
		
	rectGroup.append('rect')
	      .attr("fill", "#FF8C64")
	      .attr("x", d => x(d.key))
	      .attr("y", d => y(d.stats.counter))
	      .attr("height", d => y(0) - y(d.stats.counter))
	      .attr("width", x.bandwidth());
		  
	rectGroup.append('rect')
	      .attr("fill", "#A3A1A8")
	      .attr("x", d => x(d.key))
	      .attr("y", d => y(d.stats['udp']))
	      .attr("height", d => d.stats['udp'] ? y(0) - y(d.stats['udp']) : 0)
	      .attr("width", x.bandwidth());
		  
	xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).tickSizeOuter(0).ticks(10))

	yAxis = g => g
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))
		.call(g => g.select(".domain").remove())
	  
	svg.append("g")
	    .call(xAxis);
		
	svg.selectAll('.tick text')
		.attr('opacity', function(d,i){
			return i%2 == 0 ? 0 : 1
		})
		
	svg.append("g")
	    .call(yAxis);
			
	  
}