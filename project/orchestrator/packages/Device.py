"""
`Device` package is used to represent a device
"""
import logging
import json
import os

class Device:
    """
    Class `Device` represents a device.
    Attributes:
        - deviceType: The type of the device
        - deviceID: The ID of the device
        - status: The status of the device
        - mac: The MAC address of the device
        - ip: The IP address of the device
        - blockedMac: The list of blocked macs
    """
    deviceType: str
    deviceID: str
    status: str
    mac: str
    ip: str
    blockedMac: list[str]

    def __init__(self, deviceType: str, deviceID: str, status: str, mac: str, ip: str) -> None:
        """
        Initialize the class
        Args:
            - deviceType: The type of the device
            - deviceID: The ID of the device
            - status: The status of the device
            - mac: The MAC address of the device
            - ip: The IP address of the device
        """
        self.deviceType = deviceType
        self.deviceID = deviceID
        self.status = status
        self.mac = mac
        self.ip = ip
        self.blockedMac = []

    def __str__(self) -> str:
        """
        Return the string representation of the device
        Returns:
            - The string representation of the device
        """
        return f"Device: {self.deviceType}, {self.deviceID}, {self.status}, {self.mac}, {self.ip}"
    
    def json_to_str(self) -> str:
        """
        Transform the Device data to JSON format
        Returns:
            - The Device data in JSON format
        """
        data: json = {
            "type": self.deviceType,
            "id": self.deviceID,
            "status": self.status,
            "mac": self.mac,
            "ip": self.ip
        }
        return json.dumps(data)

    def configure_device(self) -> None:
        """
        Configure the device
        """
        if self.deviceType == "OBU":
            os.system(f'docker exec --privileged fleeta-obu-{self.deviceID} /bin/bash -c "sh configBridge.sh"')
            return True
        elif self.deviceType == "RSU":
            os.system(f'docker exec --privileged fleeta-rsu-{self.deviceID} /bin/bash -c "sh configBridge.sh"')
            return True
        else:
            return False

    def block_device(self, macToBlock: str) -> bool:
        """
        Block the device
        Args:
            - macToBlock: The MAC address of the device to block
        returns:
            - True if the device is blocked, False otherwise
        """
        if macToBlock in self.blockedMac:
            return False
        
        if self.deviceType == "OBU":
            os.system(f"docker exec fleeta-obu-{self.deviceID} block {macToBlock}")
            self.blockedMac.append(macToBlock)
            return True
        elif self.deviceType == "RSU":
            os.system(f"docker exec fleeta-rsu-{self.deviceID} block {macToBlock}")
            self.blockedMac.append(macToBlock)
            return True
        else:
            return False
        
    def unblock_device(self, macToUnblock: str) -> bool:
        """
        Unblock the device
        Args:
            - macToUnblock: The MAC address of the device to unblock
        returns:
            - True if the device is unblocked, False otherwise
        """
        if macToUnblock not in self.blockedMac:
            return False
        
        if self.deviceType == "OBU":
            os.system(f"docker exec fleeta-obu-{self.deviceID} unblock {macToUnblock}")
            self.blockedMac.remove(macToUnblock)
            return True
        elif self.deviceType == "RSU":
            os.system(f"docker exec fleeta-rsu-{self.deviceID} unblock {macToUnblock}")
            self.blockedMac.remove(macToUnblock)
            return True
        else:
            return False