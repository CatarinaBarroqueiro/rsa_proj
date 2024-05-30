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
}
