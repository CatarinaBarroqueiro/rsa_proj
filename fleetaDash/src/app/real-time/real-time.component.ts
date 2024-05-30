import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpParams } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';


@Component({
  selector: 'app-real-time',
  standalone: true,
  imports: [SideNavComponent, CommonModule, HttpClientModule],
  templateUrl: './real-time.component.html',
  styleUrl: './real-time.component.css'
})
export class RealTimeComponent {

    public selectedItem: any;
    public obuSend : any;
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

    private svgRSUicon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 50 50">
      <image href="assets/antena.png" width="50" height="50" />
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

  // Declare a variable to hold the subscription
  private dataSubscription: Subscription | undefined;
  
  fetchRealTime() {
    // Clear any existing subscription
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  
    this.dataSubscription = interval(1000).subscribe(() => {
      const url = 'http://localhost:3000/realtime';
      this.http.get<any>(url).subscribe(
        (response) => {
          console.log("Data : " + JSON.stringify(response));
          
          // Clear existing data
          this.clearMapData();
    
          // Check if the response has data
          if (response && response.data && response.data.length > 0) {
            const lastItem = response.data[response.data.length - 1];
            // Debugging: log the raw strings before parsing
            console.log("Raw obus string:", lastItem.obus);
            console.log("Raw connectivity string:", lastItem.connectivity);
    
            try {
              // Clean and parse the JSON strings
              const obusString = lastItem.obus.replace(/\\n/g, "").replace(/\\"/g, '"').replace(/^"|"$/g, '');
              const connectivityString = lastItem.connectivity.replace(/\\n/g, "").replace(/\\"/g, '"').replace(/^"|"$/g, '');
                
              console.log("Cleaned obus string:", obusString);
              console.log("Cleaned connectivity string:", connectivityString);
    
              const obus = JSON.parse(obusString);
              const connectivity = JSON.parse(connectivityString);
    
              // Process obus data
              if (obus) {
                obus.forEach((obu: { obu: string, location: { latitude: number, longitude: number } }) => {
                  const { obu: label, location: { latitude, longitude } } = obu;
                  const coords: L.LatLngTuple = [latitude, longitude];
                  let type: string = 'car';
                  if (!isNaN(Number(obu.obu)) && Number(obu.obu) > 99) {
                    type = 'rsu';
                  }
                  this.markerData.push({ coords, label, type });
                });
              }

    
              // Process connectivity data
              if (connectivity) {
                connectivity.forEach((connection: { pair: { obu1: string, obu2: string } }) => {
                  const { obu1, obu2 } = connection.pair;
                  this.connections.push([obu1, obu2]);
                });
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
              console.error('Original obus string:', lastItem.obus);
              console.error('Original connectivity string:', lastItem.connectivity);
            }
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
    });
  }
  
  // Function to clear existing map data
  private clearMapData() {
    this.markers.forEach(marker => {
      marker.removeFrom(this.map);
    });
    this.markers = [];
    this.connections = [];
    this.markerData = [];
  }  

  private initializeMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }

 
  private createCustomIcon(label: string, type: string): L.DivIcon {
    let iconSvg: string;
    if (type === 'car') {
      iconSvg = this.svgCarIcon;
    } else if (type === 'rsu') {
      iconSvg = this.svgRSUicon;
    } else {
      throw new Error(`Unknown type: ${type}`);
    }
  
    let backgroundColor = 'rgba(255, 255, 255, 0.8)'; 
  
    for (const pair of this.connections) {
      if (pair.includes(label)) {
        // If connected, change the background color to green
        backgroundColor = 'rgba(0, 255, 0, 0.8)'; // Green background for connected cars
        break; // Exit loop once the connection is found
      }
    }
  
    return L.divIcon({
      html: `
        <div style="background-color: ${backgroundColor}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
          ${iconSvg}
        </div>
        <div style="position: absolute; top: 35px; left: -15px; width: 60px; text-align: center; font-size: 12px;">
         <b> ${label} </b>
        </div>
      `,
      className: 'custom-icon'
    });
  }
  
  
  private addMarkers() {
    this.markerData.forEach(data => {
      const marker = L.marker(data.coords, { icon: this.createCustomIcon(data.label, data.type) });
      marker.addTo(this.map);

      marker.on('click', () => {
        this.selectedItem = this.connections;
        this.obuSend = data;
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
