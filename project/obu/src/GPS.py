"""
`GPS` package is used to simulate the GPS module of the OBU, by reading the coordinates of a
generated GPX file.
"""
import json
from xml.dom.minidom import Element
import xml.etree.ElementTree as ET
import os
import datetime

class Location:
    """
    Class `Location` represents a location on the map.
    Attributes:
        - latitude: The latitude of the location
        - longitude: The longitude of the location
        - elevation: The elevation of the location
        - timestamp: The timestamp of the location
    """
    latitude: str
    longitude: str
    elevation: str
    timestamp: datetime.datetime

    def __init__(self, latitude: str, longitude: str, elevation: str, timestamp: datetime.datetime) -> None:
        """
        Initialize the class
        Args:
            - latitude: The latitude of the location
            - longitude: The longitude of the location
            - elevation: The elevation of the location
            - timestamp: The timestamp of the location
        """
        self.latitude = latitude
        self.longitude = longitude
        self.elevation = elevation
        self.timestamp = timestamp

    def __str__(self) -> str:
        """
        Return the string representation of the location
        Returns:
            - The string representation of the location
        """
        return f"Location: {self.latitude}, {self.longitude}, {self.elevation}, {self.timestamp}"
    
    def json_to_str(self) -> str:
        """
        Transform the Location data to JSON format
        Returns:
            - The Location data in JSON format
        """
        data: json = {
            "type": "GPS",
            "latitude": self.latitude,
            "longitude": self.longitude,
            "elevation": self.elevation,
            "timestamp": str(self.timestamp)
        }
        return json.dumps(data)


class GPS:
    """
    Class `GPS` generates GPS coordinates, representing the position of the OBU.
    Attributes:
        - gpxFileName: The name of the GPX file to read
    """
    def __init__(self, gpxFileName: str) -> None:
        """
        Initialize the class
        Args:
            - gpxFileName: The name of the GPX file to read
            - trkptOffset: The offset of the <trkpt> element in the GPX file
        Raises:
            - FileNotFoundError: If the GPX file does not exist
        """
        # GPX file name
        self.gpxFileName: str = gpxFileName
        self.trkptOffset: int = 0

        # Check if the GPX file exists
        if not os.path.exists(self.gpxFileName):
            raise FileNotFoundError(f"GPX file '{self.gpxFileName}' not found")
        

    def get_location(self) -> Location | None:
        """
        Get the location data from the GPX file.
        Returns:
            - A tuple containing the latitude, longitude, and elevation
            - None if all locations have been read
        """
        # Read the location data from the GPX file
        trkpt = self._read_location_from_file()
        if trkpt == None:
            return None

        lat: str = trkpt.attrib["lat"]
        lon: str = trkpt.attrib["lon"]
        ele: str = trkpt.find("{http://www.topografix.com/GPX/1/1}ele").text
        timestamp: datetime.datetime = datetime.datetime.now()

        return Location(lat, lon, ele, timestamp)
    

    def _read_location_from_file(self) -> ET.Element | None:
        """
        Private helper method.
        Read a new location data from the GPX file. It keeps keep track of the last read location.
        Returns:
            - A new <trkpt> element from the GPX file, 
            - None if all locations have been read
        """
        # Open the GPX file
        with open(self.gpxFileName, 'r') as file:
            # Parse the GPX file as XML
            tree: ET.ElementTree = ET.parse(file)
            root: ET.Element = tree.getroot()
            
            # Find the next <trkpt> element based on the last read location index
            trkptElements: list[ET.Element] = root.findall(".//{http://www.topografix.com/GPX/1/1}trkpt")  #".//trkpt")
            if self.trkptOffset < len(trkptElements):
                trkptElement: ET.Element = trkptElements[self.trkptOffset]

                # Update the last read location offset
                self.trkptOffset += 1

                return trkptElement
            else:
                return None
    