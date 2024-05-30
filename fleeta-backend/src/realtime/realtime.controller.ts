import { Controller, Get, HttpStatus, Query, Post, Body, Req, Headers, Delete } from '@nestjs/common';
import * as moment from 'moment';
import { Request } from 'express';
import { AppService } from 'src/app.service';
import { RealtimeService } from './realtime.service';


@Controller('realtime')
export class RealtimeController {
    
    res;

    constructor(private readonly realtimeService: RealtimeService,private readonly appService: AppService) { }

    @Get('')
    async getRealTime(@Req() request: Request, @Headers() headers: { authorization: string }) {
    
        let api = {
            op: 'Get RealTime',
            date: moment().toString(),
            request: request,
            result: null,
            validation: null
        };

        try {
            api.result = await this.realtimeService.findAll();
            if (api.result !== null) {
                this.res = this.appService.handleResponse(true, 'Done! ✔️', HttpStatus.OK, api);
            } else {
                this.res = this.appService.handleResponse(false, 'Server error! ❌️', HttpStatus.INTERNAL_SERVER_ERROR, api);
            }
        } catch (error) {
            api.validation = null;
            api.result = error;
            this.res = this.appService.handleResponse(false, 'Server error! ❌️', HttpStatus.INTERNAL_SERVER_ERROR, api);
        }
        return this.res;
 
    }

    @Post()
    async postRealTime(@Body() realTime: { obus: { obu: string, latitude: number, longitude: number }[], connectivity: { pair: { obu1: string, obu2: string } }[] },@Req() request: Request, @Headers() headers: { authorization: string }) {
    
        let api = {
            op: 'Post Real Time',
            date: moment().toString(),
            request: realTime,
            result: null,
            validation: null
        };

        try {
            api.result = await this.realtimeService.save(realTime); 
            if (api.result !== null) {
                this.res = this.appService.handleResponse(true, 'Done! ✔️', HttpStatus.OK, api);
            } else {
                this.res = this.appService.handleResponse(false, 'Server error! ❌️', HttpStatus.INTERNAL_SERVER_ERROR, api);
            }
        } catch (error) {
            api.validation = null;
            api.result = error;
            this.res = this.appService.handleResponse(false, 'Server error! ❌️', HttpStatus.INTERNAL_SERVER_ERROR, api);
        }
        return this.res;

    }

    @Delete()
    async deleteRealTime(@Query('id') id: string,@Req() request: Request, @Headers() headers: { authorization: string }) {
     
        let api = {
            op: 'Delete Real Time',
            date: moment().toString(),
            request: id,
            result: null,
            validation: null
        };

        try {
            api.result = await this.realtimeService.remove(id);
            if (api.result !== null) {
                this.res = this.appService.handleResponse(true, 'Done! ✔️', HttpStatus.OK, api);
            } else {
                this.res = this.appService.handleResponse(false, 'Server error! ❌️', HttpStatus.INTERNAL_SERVER_ERROR, api);
            }
        } catch (error) {
            api.validation = null;
            api.result = error;
            this.res = this.appService.handleResponse(false, 'Server error! ❌️', HttpStatus.INTERNAL_SERVER_ERROR, api);
        }
        return this.res;
        
    }
}
