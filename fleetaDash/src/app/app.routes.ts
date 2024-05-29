import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { RealTimeComponent } from './real-time/real-time.component';
export const routes: Routes = [
    {
        path: '',
        component: MapComponent,
        title: 'Map Page'
    },
    {
        path: 'realtime',
        component: RealTimeComponent,
        title: 'Real Time Page'
    }
];
