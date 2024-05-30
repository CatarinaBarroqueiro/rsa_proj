import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  standalone:true,
  imports:[CommonModule,
    FormsModule, MapComponent],
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  @Input() item: any;
  @Input() itemReceived: any;
  public isFiltered: boolean = false; 
  public icon: any;
  public description : string = "";

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() showRouteClicked: EventEmitter<void> = new EventEmitter<void>();
  @Output() showFilterClicked: EventEmitter<void> = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onShowRouteClicked() {
    this.showRouteClicked.emit();
  }

  onShowFilterClicked() {
    this.showFilterClicked.emit();
  }
  
  isConnectionsArray(item: any): boolean {
    return Array.isArray(item) && item.length > 0 && item[0].length === 2;
  }

  getIconForEvent(eventLabel: string): string {
    console.log("EVENT " + eventLabel);
    const allEvents = [
        "ACCIDENT", "VEHICLE_MOVING", "VEHICLE_STOPPED", "SPEED_LIMIT_EXCEEDED",
        "FUEL_DROP", "FUEL_INCREASE", "DRIVER_CHANGED", "ENGINE_STARTED",
        "ENGINE_STOPPED", "DOOR_OPENED", "DOOR_CLOSED", "WINDOW_OPENED",
        "WINDOW_CLOSED", "SOS", "VIBRATION", "OVERSPEED", "TAMPERING",
        "LOW_POWER", "LOW_BATTERY", "HIGH_TEMPERATURE", "LOW_TEMPERATURE", "MAINTENANCE"
    ];
    this.description = eventLabel.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    console.log("allEvents: ", allEvents);

    const eventIndex = allEvents.findIndex(event => event === eventLabel);
    console.log("EVENT INDEX " + eventIndex);


    const groupNumber = eventIndex+1; // Adding 1 to eventIndex because array index starts from 0

    return `assets/icons/${groupNumber}.png`;
}




}
