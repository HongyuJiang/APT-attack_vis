function createTimeline(dataset, dateDict){
	
	console.log(dataset, dateDict)
	
	let bins = {}
	
	dataset.forEach(function(d){
		
		let service = d.service
		let time_key = d.time.getMinutes() + 'M-' + d.time.getSeconds()
		
		if(bins[time_key] != undefined){
			
			if (bins[time_key][service] != undefined){
				
				bins[time_key][service] += 1
				
			} 
			else{
				
				bins[time_key][service] = 1

			}
		} 
		else{
			
			bins[time_key] = {}
			bins[time_key][service] = 1
	
		}
		
	})
	
	let bins_list = []
	
	for (let key in bins){
		
		let meta = bins[key]
		
		for (let service in meta){
			
			bins_list.push({'key':key,'stats':{'service':service,'value':meta[service]}})
		}
		
	}

	
	let height = 300
	let width = 1100
	
	let margin = ({top: 20, right: 0, bottom: 30, left: 40})
	
		
	let min_date = d3.min(bins_list, (function(d){
			
			let date_arr = d.key.split('M-')
			
			let date = new Date('1990-01-01 00:' + date_arr[0] + ':' + date_arr[1])
			
			return date
		}))
		
	let max_date = d3.max(bins_list, (function(d){
			
			let date_arr = d.key.split('M-')
			
			let date = new Date('1990-01-01 00:' + date_arr[0] + ':' + date_arr[1])
			
			return date
		}))
		
	console.log(min_date, max_date)
		
	x = d3.scaleTime()
		.domain([min_date, max_date])
		.range([margin.left, width - margin.right])
		
	
	y = d3.scaleLinear()
		.domain([0, d3.max(bins_list, d => d.stats.value)]).nice()
		.range([height - margin.bottom, margin.top])
	
	const svg = d3.select('#timeline')
		.append('svg')
		.attr('width', width)
		.attr('height', height)
		
	svg.append("g")
	.attr("class", "brush")
	.call(d3.brushX()
	    .extent([[0, margin.top], [width, height - margin.bottom]])
	    .on("end", brushended));
		
	  
	let rectGroup = svg.selectAll('.rectGroup')
		.data(bins_list)
		.enter()
		.append("g")
		.on('click', function(d){
			
			filterGroupNetwork([d])
				
		})
		
	
	rectGroup.append('circle')
	      .attr("fill", d => d.stats.service == 'tcp' ? '#FF8C64' : '#666')
	      .attr("cx", function(d){
	      			  
	      		let date_arr = d.key.split('M-')
	      		let date = new Date('1990-01-01 00:' + date_arr[0] + ':' + date_arr[1])	  
	      		return x(date)
				
	      })
		  .attr('opacity', 0.5)
	      .attr("cy", d => y(d.stats.value))
	      .attr('stroke-width', 2)
	      .attr('stroke', 'black')
	      .attr("r", 5);
		  
	xAxis = g => g
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(d3.axisBottom(x).ticks(20).tickFormat(d3.timeFormat("%H:%M:%S")))

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
		
	let legend = svg.append("g")

	legend.append('rect')
	.attr('width',10)
	.attr('height',10)
	.attr('fill','#A3A1A8')
	.attr('x', width - 100)
	.attr('y', 50)
	
	legend.append('text')
	.attr('font-size', 12)
	.attr('x', width - 70)
	.attr('y', 60)
	.text('UDP')
	
	legend.append('rect')
	.attr('width',10)
	.attr('height',10)
	.attr('fill','#FF8C64')
	.attr('x', width - 200)
	.attr('y', 50)
	
	legend.append('text')
	.attr('font-size', 12)
	.attr('x', width - 170)
	.attr('y', 60)
	.text('TCP')
	 
			
	function brushended() {
		
		let focus = []
		
		if (!d3.event.sourceEvent) return; // Only transition after input
		if (!d3.event.selection) return; // Ignore empty selections.
		var d0 = d3.event.selection;
		
		svg.selectAll('circle')
		.attr('opacity', function(d){
			
			let pos_x = parseFloat(d3.select(this).attr('cx'))
			
			if(pos_x <= d0[1] && pos_x >= d0[0]){
				focus.push(d)
				return '1'
			}
			else
				return '0.3'
		})
		
		
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
			
			let date = d.key
			
			let data_arr = date.split('M-')
			
			let stamp = '' + (data_arr[0] * 60 + parseInt(data_arr[1]))
				
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