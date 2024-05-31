import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { RealTimeComponent } from './real-time/real-time.component';
import { LoginComponent } from './login/login.component';
export const routes: Routes = [
    {
        path: 'main',
        component: MapComponent,
        title: 'Map Page'
    },
    {
        path: 'realtime',
        component: RealTimeComponent,
        title: 'Real Time Page'
    },
    {
        path: '',
        component: LoginComponent,
        title: 'Login Page'
    }
];
