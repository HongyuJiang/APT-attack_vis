
function createAnimation(datesDict, container){
	
	let min_date = d3.min(d3.keys(datesDict))
	
	let global_stamp = parseInt(min_date);
	
	var timer = setInterval(function round(){
			
		if (datesDict[global_stamp] != undefined){
			
			let index = 0
			
			datesDict[global_stamp].forEach(function(meta){
				
				let source = {'name': meta.source, 'port':meta.sourcePort}
				let target = {'name': meta.target, 'port':meta.targetPort}
				let service =  meta.service
				
				createAPacket(container, source, target, service, index)
				
				index += 1
				
				//console.log(sourcePosition, targetPosition)
			})
		}
		else{
			
			console.log(global_stamp)
		}
		
		global_stamp += 1
		
	}, 200)
	
}

function createAPacket(container, source, target, service, index){
	
	let sourceName = 'N' + source.name.replace(/\./g,'+')
	let targetName = 'N' + target.name.replace(/\./g,'+')
	
	let pathName = sourceName + '-' + targetName
	
	let pathSelector = '[id="' + pathName + '"]'
	
	sourceSelector = '[id="' + source.name.replace(/\./g,'+') + '"]'
	//targetSelector = '[id="' + target.name.replace(/\./g,'+') + '"]'
	
	sourcePosition = d3.select(sourceSelector).attr('loc').split(',')
	//targetPosition = d3.select(targetSelector).attr('loc').split(',')
	
	//console.log(sourcePosition, targetPosition)
	
	pathNode = d3.select(pathSelector).node()
	
	let packet = container.append('g')
	.attr('transform', 'translate(' + sourcePosition[0] + ',' + sourcePosition[1] + ')')
	
	packet.append('circle')
	.attr('r',5)
	.attr('fill','red')
	.attr('opacity','0.3')
	
	packet.append('text')
	//.attr('transform', d => 'rotate(' + (-Math.random()*45) + ')')
	.attr('y', index * 10)
	.attr('x', 10)
	.attr('font-size', 11)
	.text(source.port + '->' + target.port + ' :' + service)
	
	packet.transition()
      .duration(1000)
      .attrTween("transform", translateAlong(pathNode))
      .remove()
	
	
}

function translateAlong(path) {
	
  var l = path.getTotalLength();
  
  return function(d, i, a) {
    return function(t) {
      
      var p = path.getPointAtLength(t * l);
      
      return "translate(" + p.x + "," + p.y + ")";
    };
  };
}