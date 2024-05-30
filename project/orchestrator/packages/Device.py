"""
`Device` package is used to represent a device
"""
import logging
import json
from math import log
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
    dbHash: str
    blockedMac: list[str]

    def __init__(self, deviceType: str, deviceID: str, status: str, mac: str, ip: str, dbHash: str) -> None:
        """
        Initialize the class
        Args:
            - deviceType: The type of the device
            - deviceID: The ID of the device
            - status: The status of the device
            - mac: The MAC address of the device
            - ip: The IP address of the device
            - bdHash: The hash of the device
        """
        self.deviceType = deviceType
        self.deviceID = deviceID
        self.status = status
        self.mac = mac
        self.ip = ip
        self.dbHash = dbHash
        self.blockedMac = []

    def __str__(self) -> str:
        """
        Return the string representation of the device
        Returns:
            - The string representation of the device
        """
        return f"Device: {self.deviceType}, {self.deviceID}, {self.status}, {self.mac}, {self.ip}, {self.dbHash}"
    
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
            "ip": self.ip,
            "dbHash": self.dbHash
        }
        return json.dumps(data)

    def configure_device(self) -> bool:
        """
        Configure the device
        Returns:
            - True if the device is successfully configured, False otherwise
        """
        if self.deviceType == "OBU":
            ret = os.system(f'docker exec --privileged fleeta-obu_{self.deviceID} /bin/bash -c "sh configBridge.sh"')
        elif self.deviceType == "RSU":
            ret = os.system(f'docker exec --privileged fleeta-rsu_{self.deviceID} /bin/bash -c "sh configBridge.sh"')  
        else:
            logging.error("Invalid device type")
            return False
        
        if ret == 0:
            logging.debug(f"Configured Bridge of {self.deviceType}: {self.deviceID}")
            return True
        else:
            logging.error(f"Error configuring Bridge of {self.deviceType}: {self.deviceID}")
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
            logging.error("Device is already blocked")
            return False
        
        if self.deviceType == "OBU":
            ret = os.system(f"docker exec --privileged fleeta-obu_{self.deviceID} block {macToBlock}")
        elif self.deviceType == "RSU":
            ret = os.system(f"docker exec --privileged fleeta-rsu_{self.deviceID} block {macToBlock}")
        else:
            logging.error("Invalid device type")
            return False
        
        if ret == 0:
            logging.debug(f"The {self.deviceType}_{self.deviceID} has blocked the device with MAC: {macToBlock}")
            self.blockedMac.append(macToBlock)
            return True
        else:
            logging.error(f"Error occurred while blocking the device with MAC: {macToBlock} on {self.deviceType}_{self.deviceID}")
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
        
        #if self.deviceType == "OBU":
        #    os.system(f"docker exec --privileged fleeta-obu_{self.deviceID} unblock {macToUnblock}")
        #    self.blockedMac.remove(macToUnblock)
        #    return True
        #elif self.deviceType == "RSU":
        #    os.system(f"docker exec --privileged fleeta-rsu_{self.deviceID} unblock {macToUnblock}")
        #    self.blockedMac.remove(macToUnblock)
        #    return True
        #else:
        #    return False
        
        if self.deviceType == "OBU":
            ret = os.system(f"docker exec --privileged fleeta-obu_{self.deviceID} unblock {macToUnblock}")
        elif self.deviceType == "RSU":
            ret = os.system(f"docker exec --privileged fleeta-rsu_{self.deviceID} unblock {macToUnblock}")
        else:
            logging.error("Invalid device type")
            return False
        
        if ret == 0:
            logging.debug(f"The {self.deviceType}_{self.deviceID} has unblocked the device with MAC: {macToUnblock}")
            self.blockedMac.remove(macToUnblock)
            return True
        else:
            logging.error(f"Error occurred while unblocking the device with MAC: {macToUnblock} on {self.deviceType}_{self.deviceID}")
            return False