import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as L from 'leaflet';

L.Icon.Default.imagePath = 'assets/leaflet/';
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
