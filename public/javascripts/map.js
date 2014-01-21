function Map(tweets) {
	var map = L.map('map').setView([51.5, -0.09], 2);

	L.tileLayer('http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
		key: 'a4749a1e18094bb5bb46cd58efa05561'
	}).addTo(map);

	var LeafIcon = L.Icon.extend({
		options: {
			iconSize:     [40, 40],
			shadowSize:   [50, 64],
			iconAnchor:   [22, 94],
			shadowAnchor: [4, 62],
			popupAnchor:  [0, -90]
		}
	});
	
	for(var i=0; i<tweets.length; i++){
		if(tweets[i].value.coordinate){
			latlon = [tweets[i].value.coordinate.coordinates[1], tweets[i].value.coordinate.coordinates[0]];
			marker = new LeafIcon({iconUrl: tweets[i].sentiment.emoticon});
			popup = tweets[i].value.user + ": " + tweets[i].value.text;
			L.marker(latlon, {icon: marker}).bindPopup(popup).addTo(map);
		}
	}

/*
	var greenIcon = new LeafIcon({iconUrl: '../docs/images/leaf-green.png'}),
		redIcon = new LeafIcon({iconUrl: '../docs/images/leaf-red.png'}),
		orangeIcon = new LeafIcon({iconUrl: '../docs/images/leaf-orange.png'});

	L.marker([51.5, -0.09], {icon: greenIcon}).bindPopup("I am a green leaf.").addTo(map);
	L.marker([51.495, -0.083], {icon: redIcon}).bindPopup("I am a red leaf.").addTo(map);
	L.marker([51.49, -0.1], {icon: orangeIcon}).bindPopup("I am an orange leaf.").addTo(map);
*/
}