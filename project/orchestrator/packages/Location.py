"""
`Location` package is used to represent the location of the OBU/RSU on the map
"""
import logging
import json
import math
import datetime


class Location:
    """
    Class `Location` represents a location on the map.
    Attributes:
        - latitude: The latitude of the location
        - longitude: The longitude of the location
        - elevation: The elevation of the location
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
    
    @staticmethod
    def locations_close(location1, location2) -> bool:
        """
        Check if two locations are close to each other. Within a radius of 100 meters (including elevation)
        Args:
            - location1: The first location
            - location2: The second location
        Returns:
            - True if the locations are close to each other, False otherwise
        """
        latDiff = abs(float(location1.latitude) - float(location2.latitude))
        lonDiff = abs(float(location1.longitude) - float(location2.longitude))
        elevDiff = abs(float(location1.elevation) - float(location2.elevation))

        # Convert latitude and longitude difference to meters
        # Approximate conversions: latitude: 1 deg = 110.574 km, longitude: 1 deg = 111.320*cos(latitude) km
        latDiffMeters = latDiff * 110574
        lonDiffMeters = lonDiff * 111320 * math.cos(math.radians(float(location1.latitude)))

        # Calculate 3D Euclidean distance
        distance = math.sqrt(latDiffMeters**2 + lonDiffMeters**2 + elevDiff**2)

        return distance <= 100