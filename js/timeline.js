function createTimeline(dataset){
	
	console.log(dataset)
	
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
	  
	svg.append("g")
	      .attr("fill", "#FF8C64")
	    .selectAll("rect")
	    .data(bins_list)
	    .join("rect")
	      .attr("x", d => x(d.key))
	      .attr("y", d => y(d.stats.counter))
	      .attr("height", d => y(0) - y(d.stats.counter))
	      .attr("width", x.bandwidth());
		  
	svg.append("g")
	      .attr("fill", "#A3A1A8")
	    .selectAll("rect")
	    .data(bins_list)
	    .join("rect")
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