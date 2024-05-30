import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';



@Component({
  selector: 'app-real-time',
  standalone: true,
  imports: [SideNavComponent, CommonModule, HttpClientModule],
  templateUrl: './real-time.component.html',
  styleUrl: './real-time.component.css'
})
export class RealTimeComponent {

    public selectedItem: any;
    public sideNavOpen = false;


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


  private map!: L.Map
  markers: L.Marker[] = [
  ];
  
  private connections: string[][] = [
    ['Car A', 'Car C']
   
  ]; 
  private markerData = [
    { coords: [40.6427, -8.6481] as L.LatLngTuple, label: 'Car A', type: 'car' },
    { coords: [40.6300, -8.6481] as L.LatLngTuple, label: 'Car B', type: 'car' },
    { coords: [40.6350, -8.6581] as L.LatLngTuple, label: 'Car C', type: 'car' }
  ];


  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initializeMap();
    this.fetchRealTime();
  }


  fetchRealTime() {
    const url = 'http://localhost:3000/realtime';
    this.http.get<any>(url).subscribe(
      (response) => {
        console.log("Data : " + JSON.stringify(response));

        // Clear existing data
        this.markers = [];
        this.connections = [];
        this.markerData = [];

        // Process obus data
        if (response.obus) {
          response.obus.forEach((obu: { obu: string, location: { latitude: number, longitude: number } }) => {
            const { obu: label, location: { latitude, longitude } } = obu;
            const coords: L.LatLngTuple = [latitude, longitude];
            this.markerData.push({ coords, label, type: 'car' });

            // Create and add marker to the map
            const marker = L.marker(coords).addTo(this.map).bindPopup(label);
            this.markers.push(marker);
          });
        }

        // Process connectivity data
        if (response.connectivity) {
          response.connectivity.forEach((connection: { pair: { obu1: string, obu2: string } }) => {
            const { obu1, obu2 } = connection.pair;
            this.connections.push([obu1, obu2]);
          });
        }

        console.log('Markers:', this.markers);
        console.log('Connections:', this.connections);
        console.log('Marker Data:', this.markerData);

        this.addMarkers();
        this.centerMap();
      },
      (error) => {
        console.error('Error fetching Real Time:', error);
      }
    );
  }

  private initializeMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }

 
  private createCustomIcon(label: string, type: string): L.DivIcon {
    const iconSvg = this.svgCarIcon;
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
  
  private addMarkers() {
    this.markerData.forEach(data => {
      const marker = L.marker(data.coords, { icon: this.createCustomIcon(data.label, data.type) });
      marker.addTo(this.map);

      marker.on('click', () => {
        this.selectedItem = this.connections;
        this.toggleSideNav(true);

      });

      this.markers.push(marker);
    });
  }

  public toggleSideNav(open: boolean) {
    this.sideNavOpen = open;
  }

  private centerMap() {
    // Create a LatLngBounds object to encompass all the marker locations
    const bounds = L.latLngBounds(this.markers.map(marker => marker.getLatLng()));
    
    // Fit the map view to the bounds
    this.map.fitBounds(bounds);
  }

}
