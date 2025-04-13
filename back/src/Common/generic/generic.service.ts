import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindOneOptions,
  ObjectLiteral,
  Repository,
  UpdateResult,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export abstract class GenericService<T extends ObjectLiteral> {
  protected readonly Repos: Repository<T>;

  protected constructor(Repos: Repository<T>) {
    this.Repos = Repos;
  }

  async findAll(
    options?: FindOneOptions<T>,
    indicePage?: number,
    nbElement?: number,
  ): Promise<T[]> {
    return this.Repos.find({
      ...options,
      skip: indicePage && nbElement ? (indicePage - 1) * nbElement : undefined,
      take: nbElement ? nbElement : undefined,
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return await this.Repos.findOne(options);
  }

  async create(entity: DeepPartial<T>): Promise<T> {
    try {
      return this.Repos.save(this.Repos.create(entity));
    } catch {
      throw new Error('Error creating entity');
    }
  }

  async createMany(entity: DeepPartial<T>[]): Promise<T[]> {
    return this.Repos.save(entity);
  }

  async update(
    id: number,
    entity: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this.Repos.update(id, entity);
  }

  async removeById(id: number): Promise<void> {
    await this.Repos.delete(id);
  }

  async softDeleteById(id: number): Promise<void> {
    await this.Repos.softDelete(id);
  }

  async restoreById(id: number): Promise<void> {
    await this.Repos.restore(id);
  }
}
