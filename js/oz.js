$(document).ready(function() {
    // Variables
    var opportunityZones,
        rezoningEfforts,
        historicDistricts,
        censusTracts,
        subwayStations,
        pointsOfInterest,
        station;

    var subwayIcon = L.divIcon({className: 'my-div-icon', html: '<i class="fas fa-subway"></i>'});
    var pointOfInterestStyle = {
        radius: 5,
        fillColor: "#c01361",
        color: "#c01361",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
    var accessToken = 'pk.eyJ1IjoiYW5uLW1vcnJpcyIsImEiOiJjanF2MHpqaGgwcWJoNDNuM2QweXF3em5hIn0.h5hwebpy4nRvo2eq-XMsLg';
    var grayscale = L.tileLayer(mapboxUrl, {id: 'mapbox.light', attribution: '', maxZoom: 20, accessToken: accessToken});
    var streets = L.tileLayer(mapboxUrl, {id: 'mapbox.streets', attribution: '', maxZoom: 20, accessToken: accessToken});
    let map = L.map('map', {
        center: [40.785091, -73.968285],
        zoom: 14,
        layers: [grayscale]
    });

    let censusLayer = L.layerGroup().addTo(map);
    let ozLayer = L.layerGroup().addTo(map);
    let rezoningLayer = L.layerGroup().addTo(map);
    let historicDistrictLayer = L.layerGroup().addTo(map);
    let subwayStationsLayer = L.layerGroup().addTo(map);
    let pointsOfInterestLayer = L.layerGroup().addTo(map);

    // Geojson Ajax calls
    opportunityZones = $.getJSON("geojson/eoz-4326.geojson", function(json) {
        L.geoJSON(json, {
            style: function(feature) {
                return {'color':'#61c013', 'weight':2}
            },
            onEachFeature: addOZLayer,
        });
    });

    rezoningEfforts = $.getJSON("geojson/rezoning-4326.geojson", function(json) {
        L.geoJSON(json, {
            style: function(feature) {
                return {'color':'#13afc0', 'weight':2}
            },
            onEachFeature: addRezoningLayer,
        });
    });

    historicDistricts = $.getJSON("geojson/hd-4326.geojson", function(json) {
        L.geoJSON(json, {
            style: function(feature) {
                return {'color':'#c04113', 'weight':2}
            },
            onEachFeature: addHistoricDistrictLayer,
        });
    });

    $.when(opportunityZones, rezoningEfforts, historicDistricts).done(function() {
        censusTracts = $.getJSON("geojson/CensusTracts-4326.geojson", function(json) {
            L.geoJSON(json, {
                onEachFeature: addCensusLayer,
            });
        });
        $.when(censusTracts).done(function() {
            subwayStations = $.getJSON('geojson/subway-stations-4326.geojson', function(json) {
                L.geoJSON(json, {
                    pointToLayer: addSubwayStationsLayer,
                });
            });
            $.when(subwayStations).done(function() {
                pointsOfInterest = $.getJSON('geojson/points-4326.geojson', function(json) {
                    L.geoJSON(json, {
                        pointToLayer: addPointsOfInterestLayer,
                    });
                });
            });
        });
    });

    // Map layer additions and popup formatting
    function addOZLayer(feature, layer) {
        ozLayer.addLayer(layer);
    }

    function addRezoningLayer(feature, layer) {
        rezoningLayer.addLayer(layer);
    }

    function addHistoricDistrictLayer(feature, layer) {
        historicDistrictLayer.addLayer(layer);
    }

    function addCensusLayer(feature, layer) {
        var defaultStyle = {
            color: "transparent",
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.1,
            fillColor: 'transparent'
        };
        var highlightStyle = {
            color: '#c01361',
            weight: 3,
            opacity: 0.6,
            fillOpacity: 0.65,
            fillColor: 'transparent'
        };
        layer.setStyle(defaultStyle);
        layer.on('mouseover', function(e) {
            layer.setStyle(highlightStyle);
        });
        layer.on('mouseout', function(e) {
            layer.setStyle(defaultStyle);
        });
        censusLayer.addLayer(layer);
        var customPopup = '<div class="neighborhood">' + feature.properties.NTAName
                        + '</div>Census Tract: <strong>' + feature.properties.CTLabel
                        + '</strong><br />2017 Median Family Income: <strong>$'
                        + feature.properties.MEDFINC + '</strong><br />Percentage of Families With 12-Month Income Below Poverty Level: <strong>'
                        + feature.properties.PCTBPLVL + '%</strong>'
        var customOptions = {
            'maxWidth': 400,
            'className': 'custom-popup'
        }
        layer.bindPopup(customPopup, customOptions);
    }

    function addSubwayStationsLayer(feature, latlng) {
        customPopup = feature.properties.stop_name + " Station";
        customOptions = {
            'minWidth': 200,
            'width': 200,
            'className': 'custom-popup subway-popup'
        };
        subwayStationsLayer.addLayer(L.marker(latlng, {icon: subwayIcon})
            .bindPopup(customPopup, customOptions)
            .addEventListener("click", function (e) {
                map.panTo(this.getLatLng());
            })
        );
    }

    function addPointsOfInterestLayer(feature, latlng) {
        customPopup = feature.properties.LOCATION;
        customOptions = {
            'className': 'custom-popup point-popup'
        }
        pointsOfInterestLayer.addLayer(L.circleMarker(latlng, pointOfInterestStyle)
            .bindPopup(customPopup, customOptions)
            .addEventListener("click", function (e) {
                map.panTo(this.getLatLng());
            })
        );
    }

    // Layer control features
    var basemapControl = {
        "Grayscale": grayscale,
        "Streets": streets
    };

    let layerControl = {
        "Census Tracts": censusLayer,
        "<i class='oz'></i> Qualified Opportunity Zones": ozLayer,
        "<i class='rz'></i> City Rezoning Efforts (within OZs)": rezoningLayer,
        "<i class='hd'></i> Historic Districts (within OZs)": historicDistrictLayer,
        "<i class='fas fa-subway sb'></i> Subway Stations (near OZs)": subwayStationsLayer,
        "<i class='point'></i> Points of Interest": pointsOfInterestLayer
    };

    L.control.layers(basemapControl, layerControl).addTo(map);
});
