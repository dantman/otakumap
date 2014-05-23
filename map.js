(function($, _) {
	"use strict";

	$(function() {
		var map = L.map('map').setView([40.8434986, -98.4290106], 5);

		L.tileLayer('//services.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
			attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
			maxZoom: 16
		}).addTo(map);

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

				L.marker(con.latlon, {
					riseOnHover: true,
					zIndexOffset: con.attendance
				}).addTo(map)
					.bindPopup(msg);

				var color =
					con.attendance > 20000 ? '#00C8FF' :
					con.attendance > 15000 ? '#1C8BFF' :
					con.attendance > 10000 ? '#00FFAC' :
					con.attendance > 6000 ? '#00FF3D' :
					con.attendance > 1000 ? '#FF00A8' :
					'#EF0100';

				L.circleMarker(con.latlon, {
					color: color,
					radius: con.circle,
					opacity: 0.5
				}).addTo(map);
			});
		});
	});
})(jQuery, _);
