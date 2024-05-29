import { Injectable, Controller } from '@nestjs/common';
const winston = require('winston');
require('winston-daily-rotate-file');



@Injectable()
export class AppService {
  transport;
  logger;

  constructor(){
     //logs
     this.transport = new (winston.transports.DailyRotateFile)({
      filename: 'fuelLink_back-%DATE%.log',
      dirname: './logs',
      maxSize: '10MB',
      datePattern: 'DD-MM-YYYY',
      maxFiles: '180d'
    });

    this.transport.on('rotate', function (oldFilename, newFilename) {
    });

    this.logger = winston.createLogger({
      transports: [
        this.transport
      ]
    });
  }


  async handleResponse(sucess: boolean, message: string, http_code: number, api: any) {
    try {
      let response = {
        sucess: sucess,
        message: message,
        http_code: http_code,
        op: api.op,
        start: api.date,
        finish: new Date(),
        validation: api.validation,
        data: api.result
      };

      if (http_code !== 500) {
        console.log(response);
        this.logger.info(response);
      } else {
        console.error(response);
        this.logger.info(response);
      }

      const res = {
        sucess:sucess,
        http_code:http_code,
        op:api.op,
        data:api.result
      }

      return res;
    } catch (error) {
      console.error(error);
      return { sucess: false, http_code: 500, data: null };
    }
  }

  getAPI() {

    return this.getAPI();
  }

}
