d3.json("./data/mid-level-phase-3.json").then(function(dataset){
	
	
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
	
	createNetwork(linksDict, nodesDict, portsDict)
	
	createTimeline(statData, datesDict)


  //	createAnimation(datesDict, svg)

})