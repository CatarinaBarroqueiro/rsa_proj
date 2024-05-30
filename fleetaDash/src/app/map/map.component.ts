import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MarkerData } from './markerData';

@Component({
  selector: 'app-map',
  standalone:true,
  imports:[SideNavComponent,
    HttpClientModule,
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
  
  private svgWarnIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 48 48">
    <path fill="#ffb700" d="M23.99 4L4 44h40L23.99 4zm-2 32h4v4h-4v-4zm0-8h4v8h-4v-8z"/>
    <path d="M0 0h48v48H0z" fill="none"/>
  </svg>
  `;

  private svginfoIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
  <image href="assets/info-circle.svg" width="30" height="30" />
</svg>
`;

private svgRSUicon = `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 50 50">
  <image href="assets/antena.png" width="50" height="50" />
</svg>
`;
  private svgPinIcon = `
    <svg width="20" height="30" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
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

  
  private markerData = [];

  private connections: string[][] = [
    ['Car A', 'Car C']
   
  ];

  private routePolyline: L.Polyline | undefined;
  showRouteButton: boolean | undefined;
  showFilterFlag: boolean =false;
  backup:any[]=[];

  

  private createCustomIcon(label: string, type: string): L.DivIcon {
    let iconSvg: string;
  
    switch (type) {
      case 'car':
        iconSvg = this.svgCarIcon;
        break;
      case 'warn':
        iconSvg = this.svgWarnIcon;
        break;
      case 'speed':
        iconSvg = this.svginfoIcon; 
        break;
      case 'local':
        iconSvg = this.svgPinIcon;
        break;
      default:
        iconSvg = this.svgRSUicon;
    }
  
    let backgroundColor = 'rgba(255, 255, 255, 0.8)'; 
  
    for (const pair of this.connections) {
      if (pair.includes(label)) {
        backgroundColor = 'rgba(0, 255, 0, 0.8)';
        break; 
      }
    }
  
    return new L.DivIcon({
      html: `<div style="display: flex; flex-direction: column; align-items: center;">
        ${iconSvg}
        <div style="font-size: 9px; font-weight: bold; background: ${backgroundColor}; padding: 8px 12px; margin: 10px; border-radius: 6px; align-text:center;">
          ${label}
        </div>
      </div>
      `,
      className: '', 
      iconSize: type === 'car' ? [25, 25] : [25, 41], 
      iconAnchor: type === 'car' ? [12.5, 12.5] : [12.5, 41], 
      popupAnchor: [1, -34], 
    });
  }
  

  markers: L.Marker[] = [];

  constructor(private http: HttpClient) { }
  ngOnInit() {
  }
  

  ngAfterViewInit() {
    this.initializeMap();
    this.fetchMarkerData();
  }

  private initializeMap() {
    const baseMapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map');
    L.tileLayer(baseMapUrl).addTo(this.map);
  }

  private fetchMarkerData(): void {
    this.http.get<any>('http://localhost:3000/history').subscribe(response => {
      console.log('HTTP Response:', response); // Log the HTTP response
      
      if (response.data) {
        this.markerData = response.data.map((item: { latitude: string; longitude: string; obu: any; event: any; }) => {
          const coords: L.LatLngTuple = [parseFloat(item.latitude), parseFloat(item.longitude)];
          console.log('Parsed Coordinates:', coords); // Log the parsed coordinates
          
          const marker: MarkerData = {
            coords: coords,
            label: item.obu,
            type: item.event
          };
          console.log('Marker Data:', marker); // Log the marker data
          
          return marker;
        });
        console.log('Marker Data Array:', this.markerData); // Log the final marker data array
  
        // Add markers to the map and center the map after fetching data
        this.addMarkers();
        this.centerMap();
      }
    });
  }

  
  private addMarkers() {
    this.markerData.forEach((data: MarkerData) => {
      const icon = this.createCustomIcon(data.label, data.type); // Create custom icon
      const marker = L.marker(data.coords, { icon }).addTo(this.map);
  
      marker.on('click', () => {
        // Update selectedItem and showRouteButton based on marker data
        this.selectedItem = data;
        this.toggleSideNav(true);
        this.showRouteButton = data.type === 'car'; // Show route button only for cars
      });
  
      this.markers.push(marker);
    });
  }

  public showCarRoute() {
    const existingRoute = this.routePolyline && this.map.hasLayer(this.routePolyline);
  
    if (existingRoute) {
      this.map.removeLayer(this.routePolyline!);
      this.routePolyline = undefined; 
      return; 
    }
  
    if (this.carRoute.length > 0) {
      this.routePolyline = L.polyline(this.carRoute, { color: '#800020' }).addTo(this.map);
      this.map.fitBounds(this.routePolyline.getBounds());
    }
  }

  public showFilter() {
    this.showFilterFlag=!this.showFilterFlag;
    if (this.showFilterFlag) {  
      // Clear all existing markers
      this.clearMarkers();
  
      // Add marker for the selectedItem
      if (this.selectedItem) {
        const marker = L.marker(this.selectedItem.coords, { icon: this.createCustomIcon(this.selectedItem.label, this.selectedItem.type) });
        marker.addTo(this.map);
  
        marker.on('click', () => {
          // Update the selectedItem to the one found in markerData
          this.selectedItem = this.markerData.find((data:MarkerData) => data.label === this.selectedItem.label);
          this.toggleSideNav(true);
          // Show or hide the "Show Route" button based on the type of selectedItem
          this.showRouteButton = this.selectedItem.type === 'car';
        });
  
        // Add the marker to the markers array
        this.markers.push(marker);
      }
    } else {
      this.fetchMarkerData();
    }
  }
  
  
  private clearMarkers() {
    this.backup = this.markers;
    this.markers.forEach(marker => marker.removeFrom(this.map));
    this.markers = [];
  }
  
  
  

  public toggleSideNav(open: boolean) {
    this.sideNavOpen = open;
  }

  private centerMap() {
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));
    this.map.fitBounds(bounds);
  }
}
