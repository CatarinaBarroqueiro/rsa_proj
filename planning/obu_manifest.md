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

A more robust and complete, but also more complex is the **KMZ** (**Keyhole Markup Zipped**)  file format, which consists of a main **KML** (**Keyhole Markup Language**) file and zero or more supporting files that are packaged using a Zip utility into one unit, called an archive. When the KMZ file is unzipped, the main .kml file and its supporting files are separated into their original formats and directory structure, with their original filenames and extensions. In addition to being an archive format, the Zip format is also compressed, so an archive can include only a single large KML file. Depending on the content of the KML file, this process typically results in 10:1 compression. Your 10 Kbyte KML file can be served with a 1 Kbyte KMZ file ([^4]).

### File Structure

#### KML (Keyhole Markup Language)  Stores geographic data in an XML format, describing things like places, points of interest, imagery, and 3D models on the globe.

**Structure:**

* **XML Header:** Every KML file starts with a standard XML header line indicating it's an XML document and specifying the encoding (usually UTF-8). 
* **KML Namespace:** Following the header, KML files (specifically KML version 2.2 and above) include a namespace declaration. This line defines the KML vocabulary used in the file.
* **Document Element:** The core content of the KML file resides within the `<kml>` tag, which acts as the document element.

**Tags:** KML uses a hierarchy of tags to represent geographic features and define their properties. An overview of some key tags are as follows:

* **Placemark:** This fundamental tag defines a specific location or point of interest. It can contain sub-tags for:
    * `<name>`: Label displayed for the placemark.
    * `<coordinates>`: Geographic location specified by longitude, latitude, and optionally altitude.
    * `<description>`: Optional tag for adding a detailed description in HTML format.
    *  Icon and style information tags to customize the visual appearance.

* **Geometry:**  This section defines the geometric shapes displayed on the map. It can include tags for:
    * `<Point>`: Represents a single point location.
    * `<LineString>`: Defines a path or route as a sequence of connected points. 
    * `<Polygon>`: Creates a closed shape with an optional altitude for each vertex.
    * `<MultiGeometry>`: Groups multiple geometries like points, lines, or polygons together.

* **Imagery:** KML supports incorporating imagery like photos or ground overlays:
    * `<GroundOverlay>`: Places a flat image on the map surface at a specified location and size.

* **3D Models:** 3D models can be integrated using the `<Model>` tag, which references a COLLADA (.dae) file containing the 3D model data.

* **Folders:** To organize complex KML files, the `<Folder>` tags can be used to group related features like placemarks or geometries.

**Additional Points:**

* Tags are case-sensitive. Ensure proper capitalization (e.g., `<Placemark>` not `<placemark>`) for them to function correctly.
* Attributes can be added to some tags to provide further details. For instance, the `<coordinates>` tag might have an attribute specifying altitude units (meters, feet).
* KML allows linking to external files using relative paths within the KMZ archive or full web URLs for online resources.

#### KMZ (Keyhole Markup Zipped): A compressed archive format. Bundles the main KML file along with additional resources like images, icons, and 3D models used by the KML. 
* Easier storage and transfer: Since it's a single file, it's convenient to share and store.
* Compressed size: Saves space by compressing the bundled files.
* KML files can reference various external files to enhance the visualization:
    * Images (JPEG, PNG): Used for overlays, like photos on the map.
    * Icons (.gif, .png): Represent points of interest like markers or symbols.
    * COLLADA models (.dae): Integrate 3D models of buildings or structures.

**Integration with KML:** The KML file uses tags to reference the external files. These tags specify the file path relative to the KML or the full web address if it's an online resource.
* For example, an image overlay might have a tag like `<href>images/myphoto.jpg</href>` which points to an image file within the KMZ archive.


### Implementation on the GPS logger

While KML/KMZ offers some built-in data storage compared to GPX, it's still beneficial to integrate it with JSON. There are two main approaches to combine KML/KMZ with JSON for sensor data and events:

1. **KML ExtendedData:**

* KML allows embedding custom data within the `<ExtendedData>` tag of various KML elements like Placemarks, Linestrings, or Polygons.
* You can define custom tags within `<ExtendedData>` to store sensor data readings and event types along with timestamps.

**Example:**

```xml
<Placemark>
  <name>Stop at Gas Station</name>
  <ExtendedData>
    <FuelLevel>80</FuelLevel>
    <EventType>Stop</EventType>
    <Timestamp>2024-05-08T12:00:00Z</Timestamp>
  </ExtendedData>
  <Point>
    <coordinates>-122.4068, 37.7833</coordinates>
  </Point>
</Placemark>
```


2. **Linked JSON:**

* Similar to GPX integration, by creating a reference system within KML.
* Include a KML element (like a NetworkLink) that points to a separate JSON file containing detailed sensor data and events.
* This approach keeps the KML file clean and focused on geospatial data, while the JSON stores the extensive sensor information.

**Benefits:**

* **KML with ExtendedData:** Offers a more integrated approach, keeping all data within the KML/KMZ file. 
* **KML with Linked JSON:** Maintains a clean KML structure and allows for more flexible and detailed data storage in JSON.

**Challenges:**

* **KML with ExtendedData:** Requires defining and managing custom tags within KML, potentially increasing complexity. 
* **KML with Linked JSON:** Introduces similar challenges to GPX integration, requiring file management and linking mechanisms.

**Additional Considerations:**

* **KML Limitations:** KML doesn't natively validate custom data types. Ensure proper data formatting within `<ExtendedData>` tags for consistent interpretation.
* Both approaches could be used in a hybrid format, where the KML would contain all the vehicle events (fuel levels, sudden accelerations/braking...), while other vehicles data could be referenced and saved in JSON or even KML formats

### Visualization/Animation

**KML/KMZ** file formats are widely used in Spatial and Geographics application, like Google Earth. Ensuring coherent structure of the file and some modifications, could make it suitable for those applications. However, due to the modular nature of the proposed work here, it would probable more suitable to choose an open-source application to modify. Some research can be made to find a suitable platform in websites like Github [^6], with this tip being referenced to both approaches described in this file.

# References

* What is a GPX file [^1](https://hikingguy.com/how-to-hike/what-is-a-gpx-file/)
* GPX file format Developer's manula [^2](https://www.topografix.com/gpx_manual.asp#gpx_private)
* GPX track visualizer [^3](https://github.com/JoanMartin/trackanimation/tree/develop)
* KMZ and KML file formats explanation [^4](https://developers.google.com/kml/documentation/kmzarchives)
* KML file format reference [^4](https://developers.google.com/kml/documentation/kmlreference)
* Python IPFS API [^5](https://pypi.org/project/ipfs-api/)
* Github KML visualizer [^6](https://github.com/search?q=kml%20visualizer&type=repositories)
