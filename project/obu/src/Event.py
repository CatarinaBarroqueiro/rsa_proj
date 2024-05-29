"""
`Event` file contains all the code to generate an event occurring in the vehicle
"""
import logging
import json
import random
from enum import Enum

class EVENTS(Enum):
    """
    Enum `EVENTS` represents the events that can occur in the vehicle.
    Based on traccar events: https://www.traccar.org/events/
    """
    ACCIDENT = "ACCIDENT"
    VEHICLE_MOVING = "VEHICLE_MOVING"
    VEHICLE_STOPPED = "VEHICLE_STOPPED"
    SPEED_LIMIT_EXCEEDED = "SPEED_LIMIT_EXCEEDED"
    FUEL_DROP = "FUEL_DROP"
    FUEL_INCREASE = "FUEL_INCREASE"
    DRIVER_CHANGED = "DRIVER_CHANGED"
    ENGINE_STARTED = "ENGINE_STARTED"
    ENGINE_STOPPED = "ENGINE_STOPPED"
    DOOR_OPENED = "DOOR_OPENED"
    DOOR_CLOSED = "DOOR_CLOSED"
    WINDOW_OPENED = "WINDOW_OPENED"
    WINDOW_CLOSED = "WINDOW_CLOSED"
    SOS = "SOS"
    VIBRATION = "VIBRATION"
    OVERSPEED = "OVERSPEED"
    TAMPERING = "TAMPERING"
    LOW_POWER = "LOW_POWER"
    LOW_BATTERY = "LOW_BATTERY"
    HIGH_TEMPERATURE = "HIGH_TEMPERATURE"
    LOW_TEMPERATURE = "LOW_TEMPERATURE"
    MAINTENANCE = "MAINTENANCE"
    

class Event:
    """
    `Event` class is used to represent an event in the vehicle. It can generate events and store them in a file.
    An event is generated based on the probability of an event happening -> [1, eventProbability]
    Attributes:
        - eventProbability: The probability of an event happening
    """
    eventProbability: int

    def __init__(self, eventProbability: int) -> None:
        """
        Initialize the class
        Args:
            - eventProbability: The probability of an event happening
        Raises:
            - ValueError: If the event probability is less than 1
        """
        if eventProbability < 1:
            raise ValueError("Event probability must be superior or equal to 1")
        
        self.eventProbability = eventProbability

    def _generate_random_event(self) -> EVENTS:
        """
        Generate a random event, according to the `EVENTS` enum. All events have an equal probability of happening.
        Returns:
            - EVENTS object representing the event:
        """
        event: EVENTS = random.choice(list(EVENTS))
        return event

    def get_event(self) -> EVENTS | None:
        """
        Generate a random event or not, according to the probability of an event happening. The probability of an
        event happening is given by the `eventProbability` attribute.
        Returns:
            - Generated random event.
            - None in case no event happened.
        """
        probs: int = random.randint(1, self.eventProbability)
        if probs  == 1:
            return self._generate_random_event()
        else:
            return None
