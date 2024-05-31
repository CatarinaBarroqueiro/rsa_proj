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

  private carRoute: L.LatLngTuple[] = [];
  
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

  
  private markerData : MarkerData[] = [];

  private connections: string[][] = [];

  private routePolyline: L.Polyline | undefined;
  showRouteButton: boolean | undefined;
  showFilterFlag: boolean =false;
  backup:any[]=[];

  

  private createCustomIcon(label: string, type: string): L.DivIcon {
    // Convert label to an integer
    const labelNumber = parseInt(label);
  
    // Determine type based on labelNumber
    if (labelNumber > 99) {
      type = 'rsu';
    } else {
      type = 'car';
    }
  
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
      html: `        <div style="background-color: ${backgroundColor}; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
      ${iconSvg}
    </div>
    <div style="position: absolute; top: 25px; left: -10px; width: 40px; text-align: center; font-size: 12px;">
     <b> ${label} </b>
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
        // Create a map to store the latest marker data for each OBU
        const markerMap = new Map<number, any>();
  
        // Iterate through the response data to filter duplicates
        response.data.forEach((item: any) => {
          const obuId = parseInt(item.obu);
          if (!markerMap.has(obuId) || markerMap.get(obuId).id < item.id) {
            markerMap.set(obuId, item);
          }
        });
  
        // Map the filtered marker data to the final markerData array
        this.markerData = Array.from(markerMap.values()).map((item: any) => {
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

  public async showCarRoute() {
    const existingRoute = this.routePolyline && this.map.hasLayer(this.routePolyline);
    console.log("HEY" + this.selectedItem.label);

    if (existingRoute) {
      // If the route polyline exists, remove it from the map
      this.map.removeLayer(this.routePolyline!);
      this.routePolyline = undefined;
      this.carRoute = []; // Clear the carRoute array
      this.clearMarkers();
      this.fetchMarkerData();
      return; // Exit the function
    }
  
    try {
      // Make the HTTP request to fetch the data
      const response = await fetch('http://localhost:3000/history/obu?obu=' + this.selectedItem.label);
  
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }
  
      const apiResponse = await response.json();
  
      // Parse the API response to extract latitude and longitude values
      const coordinates: L.LatLngTuple[] = apiResponse.map((data: { latitude: string; longitude: string; }) => [parseFloat(data.latitude), parseFloat(data.longitude)]);
  
      // Update the carRoute array with the coordinates from the API response
      this.carRoute = coordinates.slice(0, 100); // Limit to a maximum of 10 values
  
      // Add the API response data to the markerData array
      this.markerData = apiResponse.map((data: { latitude: string; longitude: string; obu: string; event: string; }) => {
          return {
              coords: [parseFloat(data.latitude), parseFloat(data.longitude)],
              label: data.obu,
              type: data.event
          };
      });
      this.addMarkers()
  
      if (this.carRoute.length > 0) {
          // Draw the route polyline on the map
          this.routePolyline = L.polyline(this.carRoute, { color: '#800020' }).addTo(this.map);
          this.map.fitBounds(this.routePolyline.getBounds());
      }
  } catch (error) {
      console.error('Error fetching data:', error);
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
