import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from './history.entity';

@Injectable()
export class HistoryService {

    @InjectRepository(History)
    private readonly repository: Repository<History>;

    constructor() {
    }

    async findAll() {
        return await this.repository.manager.query('Select * from "history"');
    }

    async save(history: { obu: string, latitude: number, longitude: number, event: string }) {
        return await this.repository.save(history);
    }

    async remove(id: string) {
        return await this.repository.delete(id);
    }
}