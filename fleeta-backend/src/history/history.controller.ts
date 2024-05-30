import { Controller, Get, HttpStatus, Query, Post, Body, Req, Headers, Delete } from '@nestjs/common';
import { HistoryService } from './history.service';
import * as moment from 'moment';
import { Request } from 'express';
import { AppService } from 'src/app.service';

@Controller('history')
export class HistoryController {

    res;

    constructor(private readonly historyService: HistoryService,private readonly appService: AppService) { }

    @Get('')
    async getHistory(@Req() request: Request, @Headers() headers: { authorization: string }) {
    
        let api = {
            op: 'Get History',
            date: moment().toString(),
            request: request,
            result: null,
            validation: null
        };

        try {
            api.result = await this.historyService.findAll();
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
    async postHistory(@Body() history: { obu: string, latitude: number, longitude: number, event: string },@Req() request: Request, @Headers() headers: { authorization: string }) {
    
        let api = {
            op: 'Post History',
            date: moment().toString(),
            request: history,
            result: null,
            validation: null
        };

        try {
            api.result = await this.historyService.save(history); 
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
    async deleteHistory(@Query('id') id: string,@Req() request: Request, @Headers() headers: { authorization: string }) {
     
        let api = {
            op: 'Delete History',
            date: moment().toString(),
            request: id,
            result: null,
            validation: null
        };

        try {
            api.result = await this.historyService.remove(id);
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

    @Get('/obu')
    async getObu(@Query('obu') obu : string) {
        try{
           return await this.historyService.findObu(obu) 
        }catch(e){
            console.log(e)
            return "Get Obu failed";
        }   
    }

    
}
