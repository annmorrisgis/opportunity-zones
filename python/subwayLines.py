# Reads Baruch's geodatabase to obtain subway station records, and breaks each up into individual lines
# I did not wind up using this script, but am keeping it for future reference.

data = {}
data['type'] = "FeatureCollection"
data['name'] = "subways-4326"
data['crs'] = {}
data['crs']['type'] = "name"
data['crs']['properties'] = {}
data['crs']['properties']['name'] = "urn:ogc:def:crs:OGC:1.3:CRS84"
data['features'] = []
complex_id = ''
lon = longitude = 0.00

with open('subway-stations-4326.geojson') as json_file:
    json_data = json.load(json_file)
    for feature in json_data['features']:
        lines = []
        lines = feature['properties']['trains'].split(" ")
        for line in lines:
            type = 'Feature'
            properties = {}
            geometry = {}
            coordinates_copy = []
            properties['OBJECTID'] = feature['properties']['OBJECTID']
            properties['stop_id'] = feature['properties']['stop_id']
            properties['stop_name'] = feature['properties']['stop_name']
            properties['line'] = line
            properties['structure'] = feature['properties']['structure']
            properties['complex_id'] = feature['properties']['complex_id']
            properties['multi_st'] = feature['properties']['multi_st']
            properties['stop_lon'] = feature['properties']['stop_lon']
            properties['stop_lat'] = feature['properties']['stop_lat']
            geometry['type'] = feature['geometry']['type']
            geometry['coordinates'] = []

            if (complex_id == feature['properties']['complex_id']) and (complex_id is not None):
                lon = lon + 0.00012
                longitude = longitude + 0.00012
                properties['stop_lon'] = lon
                geometry['coordinates'].append(longitude)
            else:
                lon = properties['stop_lon']
                longitude = feature['geometry']['coordinates'][0]
                geometry['coordinates'].append(feature['geometry']['coordinates'][0])
                complex_id = feature['properties']['complex_id']

            geometry['coordinates'].append(feature['geometry']['coordinates'][1])

            print(properties['stop_name'] + " " + str(geometry))

            listdata = {
                "type": type,
                "properties": properties,
                "geometry": geometry
            }

            data['features'].append({"type":type,"properties":properties,"geometry":geometry})

with open('subways.geojson', 'w') as outfile:
    json.dump(data, outfile)
