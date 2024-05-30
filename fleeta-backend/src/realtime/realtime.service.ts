import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealTime } from './realtime.entity';


@Injectable()
export class RealtimeService {
    @InjectRepository(RealTime)
    private readonly repository: Repository<RealTime>;

    constructor() {
    }

    async findAll() {
        return await this.repository.manager.query('Select * from "real_time"');
    }

    async save(realTime: { obus: { obu: string, latitude: number, longitude: number }[], connectivity: { pair: { obu1: string, obu2: string } }[] }) {
        return await this.repository.save(realTime);
    }

    async remove(id: string) {
        return await this.repository.delete(id);
    }
}
