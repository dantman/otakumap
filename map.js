(function($, _) {
	// var conventions = [
	// 	{
	// 		name: "Anime Expo 2013",
	// 		attendance: 61000,
	// 		latlon: [34.041209,-118.269131]
	// 	},
	// 	{
	// 		name: "Otakon 2013",
	// 		attendance: 34892,
	// 		latlon: [39.285411,-76.617397]
	// 	},
	// 	{
	// 		name: "Anime Central 2013",
	// 		attendance: 28692,
	// 		latlon: [41.980673,-87.859903]
	// 	},
	// 	{
	// 		name: "Anime North 2013",
	// 		attendance: 23952,
	// 		latlon: [43.689598,-79.57803]
	// 	},
	// 	{
	// 		name: "FanimeCon 2013",
	// 		attendance: 23430,
	// 		latlon: [37.329065,-121.888858]
	// 	},
	// 	{
	// 		name: "A-Kon 2013",
	// 		attendance: 22366,
	// 		latlon: [32.799806,-96.827676]
	// 	},
	// 	{
	// 		name: "Anime Boston 2013",
	// 		attendance: 21200,
	// 		latlon: [42.347505,-71.084638]
	// 	},
	// 	{
	// 		name: "Sakura-Con 2013",
	// 		attendance: 21000,
	// 		latlon: [47.611783,-122.331165]
	// 	},
	// 	{
	// 		name: "Anime Weekend Atlanta 2013",
	// 		attendance: 18363,
	// 		latlon: [33.884944,-84.464854]
	// 	},
	// 	{
	// 		name: "Anime Matsuri 2013",
	// 		attendance: 14989,
	// 		latlon: [29.756787,-95.369267]
	// 	},
	// 	// Smaller cons
	// 	{
	// 		name: "Youmacon 2013",
	// 		attendance: 14496,
	// 		latlon: [42.329152,-83.039871]
	// 	},
	// 	{
	// 		name: "Otakuthon 2013",
	// 		attendance: 13357,
	// 		latlon: [45.504847,-73.559958]
	// 	},
	// 	{
	// 		name: "MomoCon 2013",
	// 		attendance: 12200,
	// 		latlon: [33.761497,-84.383422]
	// 	},
	// 	{
	// 		name: "San Japan 2013",
	// 		attendance: 11077,
	// 		latlon: [29.421484,-98.486348]
	// 	},
	// 	{
	// 		name: "Katsucon 2013",
	// 		attendance: 10686,
	// 		latlon: [38.783629,-77.016392]
	// 	},
	// 	{
	// 		name: "AnimeNEXT 2013",
	// 		attendance: 10283,
	// 		latlon: [40.538126,-74.520521]
	// 	},
	// 	// Misc. smaller ones
	// 	// {
	// 	// 	Ai-Kon Winterfest 2013
	// 	// }
	// 	// Local
	// 	{
	// 		name: "Anime Revolution 2013",
	// 		attendance: 7326,
	// 		latlon: [49.28911,-123.116055],
	// 		local: true
	// 	}
	// ];

	// window.conventions = conventions;

	$(function() {
		var map = L.map('map').setView([40.8434986, -98.4290106], 5);

		// L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		// 	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		// }).addTo(map);

		L.tileLayer('http://services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
			maxZoom: 16
		}).addTo(map);

		// L.control.coordinates({
		// 	position: "bottomleft"
		// }).addTo(map);

		$.get("conventions.csv", function(csv) {
			var conventions = _.map($.parse(csv).results.rows, function(row) {
				return {
					name: row.Name,
					attendance: typeof row.Attendance === 'string' ? parseInt(row.Attendance.replace(/,/g, ''), 10) : row.Attendance,
					attendanceText: row.Attendance,
					latlon: _.map(row.GeoPoint.split(','), parseFloat),
					location: row.Location
				};
			});

			var stats = {},
				circle = { min: 10, max: 75 };

			_(conventions).sortBy('attendance')
				.tap(function(l) {
					stats.smallest = _.first(l).attendance;
				})
				.tap(function(l) {
					stats.largest = _.last(l).attendance;
				});

			stats.diff = stats.largest - stats.smallest;

			_.each(conventions, function(con) {
				var diff = con.attendance - stats.smallest,
					scale = diff / stats.diff;

				con.circle = (circle.max - circle.min) * scale + circle.min;
			});

			_.each(conventions, function(con) {
				var msg = $('<div><b class="name"></b><br><i class="loc"></i><br><span class="attend"></p></span>')
					.find('.name').text(con.name).end()
					.find('.loc').text(con.location).end()
					.find('.attend').text(con.attendanceText).end()
					.html();

				// var icon = L.AwesomeMarkers.icon({
				// 	icon: con.local ? 'home' :
				// 		con.attendance > 20000 ? 'star' :
				// 		con.attendance < 10000 ? 'frown-o' :
				// 		'star-half-o',
				// 	markerColor: 'blue'
				// });

				L.marker(con.latlon, {
					riseOnHover: true,
					zIndexOffset: con.attendance
				}).addTo(map)
					.bindPopup(msg);

				var color =
					con.attendance > 20000 ? '#00C8FF' :
					con.attendance > 15000 ? '#1C8BFF':
					con.attendance > 10000 ? '#00FFAC':
					con.attendance > 6000 ? '#00FF3D':
					con.attendance > 1000 ? '#FF00A8':
					'#EF0100'

				L.circleMarker(con.latlon, {
					// color: '#00ACE6',
					// color: con.local ? '#07093D' :
					// 	con.attendance > 20000 ? '#0E4EAD' :
					// 	con.attendance < 10000 ? '#D5F53D' :
					// 	con.attendance < 15000 ? '#FAB142' :
					// 	'#6FA5D4',
					color: color,
					radius: con.circle,
					opacity: 0.5
				}).addTo(map);
			});
		});




	});
})(jQuery, _);
