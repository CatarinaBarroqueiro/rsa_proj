# Manifest/Functioning of the OBU

The OBU or Onboard Unit, in the scope of this project, represents the GPS tracker and logger placed in the vehicle. It's role is to log/record metrics about the vehicle, as well as communicate, using distributed ad-hoc networks, with other vehicles and also backup their data.

# Simulation

In the simulation environment, this module will communicate with the orchestrator or manager of the simulation, by MQTT and providing it's coordinates. In an upper layer of the module, as soon as the orchestrator provides connectivity between OBUs, they should establish an IPFS network and start exchanging their record information, as to it being offloaded into multiple vehicles.

## OBU 


# References

* What is a GPX file [1](https://hikingguy.com/how-to-hike/what-is-a-gpx-file/)
* GPX track visualizer [2](https://github.com/JoanMartin/trackanimation/tree/develop)
* KMZ and KML file formats explanation [3](https://developers.google.com/kml/documentation/kmzarchives)
* KML file format reference [4](https://developers.google.com/kml/documentation/kmlreference)
* Python IPFS API [5](https://pypi.org/project/ipfs-api/)
* GPX file format Developer's manula [6](https://www.topografix.com/gpx_manual.asp#gpx_private)