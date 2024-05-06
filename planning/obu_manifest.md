# Manifest/Functioning of the OBU

The OBU or Onboard Unit, in the scope of this project, represents the GPS tracker and logger placed in the vehicle. It's role is to log/record metrics about the vehicle, as well as communicate, using distributed ad-hoc networks, with other vehicles and also backup their data.

# Simulation

In the simulation environment, this module will communicate with the orchestrator or manager of the simulation, by MQTT and provide it's coordinates. In an upper layer of the module, as soon as the orchestrator provides connectivity between OBUs, they should establish an IPFS network and start exchanging their record information, as to it being offloaded into multiple vehicles.

# Logging file format

Unfortunately GPS and vehicle event loggers don't implement a standard format. Most use the AVL-GPS format to register simple information, such as position, heading, speed, and engine status, but fail to have other information easily included. Also, they are generaly more suited for packet transfer formats, since almost all GPS trackers don't have a lot of onboard memory to store data, they are made to be continously uploading data to the cloud, hence most of the processing with routes and actions isn't made in the vehicle. Other factor for this is that the AVL-GPS is a standard for data format and GPS monitoring, but the other part of the trackers, with routes, events logic, geofencing and other features are handled by the cloud of your service provider (like [traccar](https://www.traccar.org/)), enticing them to make all their services/implementations proprietary.

## Approach 1 - GPX

One of the most simple and easiest file formats to work with is **GPS** or **GPS Exchange Format**, which is simply an XML text file with geographic information such as waypoints, tracks, and routes saved in it ([^1]). It's widely used in personal GPS devices, such as workout trackers and routes or track hiking, due to it's waypoint nature. This aspects make it an ideal way to store and share location data between GPS devices and software applications.

### File Structure

GPX files are essentially text files with a `.gpx` extension. The data is organized using XML tags, which define different elements within the file. Tags act like labels describing the data they contain. They usually come in pairs, with an opening tag <tag> and a closing tag </tag> [^2]. The following list will provide some explanation, but a more detailed explanation can be found at [^1] and [^2]:

* `gpx`: This is the root element of the file, encompassing all other GPX data.
* `trk`: (Track) This tag stores a series of GPS locations you followed over time, like a hike or bike ride. It includes timestamps for each point.
    * `trkseg`: (Track Segment) This further subdivides a track into smaller segments, potentially for better organization.
    * `trkpt`: (Track Point) This tag represents a single point within a track segment, containing latitude, longitude, elevation (optional), and timestamp.
* `rte`: (Route) This tag defines a planned route with waypoints that you intend to follow, but it doesn't include timestamps.
    * `rtept`: (Route Point) Similar to `trkpt`, this tag represents a waypoint within a route, including latitude, longitude, and elevation (optional).
* `wpt`: (Waypoint) This tag describes a single point of interest with latitude, longitude, and optionally, elevation, name, and description.
* GPX files can also store other data besides basic location:
    * Names and descriptions for waypoints and routes.
    * Symbology for waypoints and routes (shown as icons on maps).

### Implementation on the GPS logger

Since the GPX file format was designed for a sport or fitness use-case, not our intended use, some external logic needs to be implemented. This approach involves a separation of location data (stored in GPX) from sensor data and events (stored in a JSON file). The GPX file acts as a reference point, while the JSON file holds the detailed information. In the GPX file:

* Maintain a standard GPX structure for storing waypoints, tracks, and routes.
* Include a custom waypoint within the GPX file specifically for referencing the linked JSON data.
* This waypoint can have a descriptive name like "EventReference".
* Within the waypoint description or comments section, embed a URL/path pointing to the corresponding JSON file. This URL/path can be a path to the JSON file, which should be stored in the same directory or in a sub-directory of the GPX file.
    * Worth mentioning that in [^2], private elements are mentioned as can be included in a `<trkpt>` or `<rtept>` tag, so the approach of using tracks or routes still needs to be evaluated.

Related to the JSON file:

* Design a JSON schema to structure sensor data and events.
* Each JSON object can represent a specific event or data point at a particular time.
* Included properties can be:
    * Timestamp: Time of the event or data recording (e.g., ISO 8601 format).
    * Sensor data: Fuel level, seatbelt status, etc.
    * Event type: Stop, acceleration, etc.
    * Nested JSON objects can be used to represent complex events with multiple data points.

#### Example

* GPX file:

```xml
<wpt lat="37.7749" lon="-122.4194">
  <name>Golden Gate Bridge</name>
  <cmt>DataFileLink: /path/to/data.json</cmt>  </wpt>
```

* JSON file:

```json
[
  {
    "timestamp": "2024-05-07T10:20:00Z",
    "sensorData": {
      "fuelLevel": 75,
      "seatbeltStatus": "engaged"
    },
    "eventType": "stop"
  },
  {
    "timestamp": "2024-05-07T10:25:12Z",
    "sensorData": {
      "fuelLevel": 74,
      "acceleration": 0.5 // g-force
    },
    "eventType": "start"
  },
  // ... more data points ...
]
```

### Visualization/Animation

In terms of animation, there are a number of services which can take GPX files and make track/path animations for easier visualization, like [^3]. However, this system won't be supporting this extension, so modifications will have to be made.

## Approach 2


# References

* What is a GPX file [^1](https://hikingguy.com/how-to-hike/what-is-a-gpx-file/)
* GPX file format Developer's manula [^2](https://www.topografix.com/gpx_manual.asp#gpx_private)
* GPX track visualizer [^3](https://github.com/JoanMartin/trackanimation/tree/develop)
* KMZ and KML file formats explanation [^4](https://developers.google.com/kml/documentation/kmzarchives)
* KML file format reference [^4](https://developers.google.com/kml/documentation/kmlreference)
* Python IPFS API [^5](https://pypi.org/project/ipfs-api/)
