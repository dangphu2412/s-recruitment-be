import { Module } from '@nestjs/common';
import { MasterDataService } from './master-data.service';
import { MasterDataController } from './master-data.controller';
import { MasterDataCommonRepository } from './master-data-common-repository.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterDataCommon } from './entities/master-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasterDataCommon])],
  controllers: [MasterDataController],
  providers: [MasterDataService, MasterDataCommonRepository],
})
export class MasterDataModule {}
