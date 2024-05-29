import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-map',
  standalone:true,
  imports:[SideNavComponent,
    CommonModule,
    FormsModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  public sideNavOpen = false;
  public selectedItem: any;

  private carRoute: L.LatLngTuple[] = [
    [40.6306, -8.6571], // University of Aveiro
    [40.6342, -8.6401], // Municipal Market
    [40.6400, -8.6468], // Forum Aveiro
    [40.6458, -8.6563], // Aveiro Marina
    [40.6404, -8.6527], // Ria de Aveiro
    [40.6389, -8.6396], // Aveiro Cathedral
    [40.6361, -8.6443], // Aveiro Museum
    [40.6427, -8.6481], // Car Location
  ];
  

  // SVG data for the red pin icon
  private svgPinIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.777 12.5 28.5 12.5 28.5S25 22.277 25 12.5C25 5.596 19.404 0 12.5 0zM12.5 18.75c-3.45 0-6.25-2.8-6.25-6.25s2.8-6.25 6.25-6.25 6.25 2.8 6.25 6.25-2.8 6.25-6.25 6.25z" fill="#FF0000"/>
    </svg>
  `;

  // SVG data for the car icon
  private svgCarIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 730 370" width="50" height="25">
  <!-- Top -->
  <rect x="140" y="20" width="440" height="260" fill="transparent" rx="250" stroke="crimson" stroke-width="20" />
  
  <!-- Body -->
  <rect x="20" y="140" width="690" height="160" fill="crimson" rx="60" />
  
  <g>
    <!-- Left line -->
    <line x1="290" y1="20" x2="290" y2="140" stroke="crimson" stroke-width="20"/>
  
    <!-- Right line -->
    <line x1="430" y1="20" x2="430" y2="140" stroke="crimson" stroke-width="20"/>
  </g>

  <g>
    <!-- Left bumper -->
    <rect x="0" y="220" width="80" height="40" fill="#999" rx="20" />
    
    <!-- Right bumper -->
    <rect x="650" y="220" width="80" height="40" fill="#999" rx="20" />
  </g>  
  
  <!-- Left wheel -->
  <g>
    <circle r="80px" fill="#222" stroke="white" stroke-width="14" cx="180" cy="280"/>    
    <circle r="30px" fill="#555" cx="180" cy="280"/>
  </g>
  
  <!-- Right wheel -->
  <g>
    <circle r="80px" fill="#222" stroke="white" stroke-width="14" cx="550" cy="280"/>
    <circle r="30px" fill="#555" cx="550" cy="280"/>
  </g>  

  <g>
    <!-- Gold light -->
    <circle r="30px" fill="gold" cx="680" cy="180"/>
    
    <!-- Orange light -->
    <circle r="20px" fill="orange" cx="30" cy="180"/>
  </g>  
</svg>
  `;

  
  private markerData = [
    { coords: [40.6306, -8.6571] as L.LatLngTuple, label: 'University of Aveiro', type: 'location' },
    { coords: [40.6374, -8.6415] as L.LatLngTuple, label: 'Train Station', type: 'location' },
    { coords: [40.6423, -8.6267] as L.LatLngTuple, label: 'Shopping Center', type: 'location' },
    { coords: [40.6427, -8.6481] as L.LatLngTuple, label: 'Car A', type: 'car' },
    { coords: [40.6300, -8.6481] as L.LatLngTuple, label: 'Car B', type: 'car' },
    { coords: [40.6350, -8.6581] as L.LatLngTuple, label: 'Car C', type: 'car' }
  ];

  private connections: string[][] = [
    ['Car A', 'Car C']
   
  ];

  private routePolyline: L.Polyline | undefined;
  showRouteButton: boolean | undefined;
  

  private createCustomIcon(label: string, type: string): L.DivIcon {
    const iconSvg = type === 'car' ? this.svgCarIcon : this.svgPinIcon;
    let backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Default background color

    // Check if the car label is part of any connected pair
    for (const pair of this.connections) {
      if (pair.includes(label)) {
        // If connected, change the background color to green
        backgroundColor = 'rgba(0, 255, 0, 0.8)'; // Green background for connected cars
        break; // Exit loop once the connection is found
      }
    }

    return new L.DivIcon({
      html: `<div style="text-align: center;">
                <div style="font-size: 14px; font-weight: bold; background: ${backgroundColor}; padding: 8px 12px; margin: 10px; border-radius: 6px; display: inline-block;">
                ${label}
                </div>
                ${iconSvg}
             </div>`,
      className: '', 
      iconSize: type === 'car' ? [25, 25] : [25, 41], 
      iconAnchor: type === 'car' ? [12.5, 12.5] : [12.5, 41], 
      popupAnchor: [1, -34], 
    });
  }

  markers: L.Marker[] = [];

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initializeMap();
    this.addMarkers();
    this.centerMap();
  }

  private initializeMap() {
    const baseMapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map');
    L.tileLayer(baseMapUrl).addTo(this.map);
  }

  private addMarkers() {
    this.markerData.forEach(data => {
      const marker = L.marker(data.coords, { icon: this.createCustomIcon(data.label, data.type) });
      marker.addTo(this.map);

      marker.on('click', () => {
        this.selectedItem = data;
        this.toggleSideNav(true);
        if (data.type === 'car') {
          this.showRouteButton = true; // Show the "Show Route" button in the navbar
        } else {
          this.showRouteButton = false; // Hide the button for other markers
        }
      });

      this.markers.push(marker);
    });
  }

  public showCarRoute() {
    // Check if the route polyline already exists on the map
    const existingRoute = this.routePolyline && this.map.hasLayer(this.routePolyline);
  
    // If the route exists, remove it from the map
    if (existingRoute) {
      this.map.removeLayer(this.routePolyline!);
      this.routePolyline = undefined; // Reset the route polyline
      return; // Exit the function
    }
  
    // If the route does not exist, add it to the map
    if (this.carRoute.length > 0) {
      this.routePolyline = L.polyline(this.carRoute, { color: 'blue' }).addTo(this.map);
      this.map.fitBounds(this.routePolyline.getBounds());
    }
  }
  
  

  public toggleSideNav(open: boolean) {
    this.sideNavOpen = open;
  }

  private centerMap() {
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));
    this.map.fitBounds(bounds);
  }
}
