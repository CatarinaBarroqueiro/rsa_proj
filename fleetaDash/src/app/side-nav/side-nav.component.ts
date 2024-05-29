import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.css'
})
export class SideNavComponent {
  @Input() item: any;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() showRouteClicked = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
  onShowRouteClicked(): void {
    this.showRouteClicked.emit();
  }

  isConnectionsArray(item: any): boolean {
    return Array.isArray(item) && item.length > 0 && item[0].length === 2;
  }
}
