import { MigrationInterface, QueryRunner } from 'typeorm';
import provinces from '../datasource/province.json';
import { Province } from '../../location';
import { ProvinceType } from '../../location/client/constants';
import keyBy from 'lodash/keyBy';

export class SeedProvinces1667020607842 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const provinceRepository = queryRunner.manager.getTreeRepository(Province);

    const cities = await provinceRepository.save(
      provinces.map((root) => {
        const city = new Province();

        city.name = root.name;
        city.code = root.codename;
        city.type = ProvinceType.CITY;

        return city;
      }),
    );

    const cityNameMapToCity = keyBy(cities, 'name');

    const districts = provinces
      .map((city) => {
        const cityEntity = cityNameMapToCity[city.name];

        return city.districts.map((district) => {
          const newDistrict = new Province();

          newDistrict.name = district.name;
          newDistrict.code = district.code + '';
          newDistrict.type = ProvinceType.DISTRICT;
          newDistrict.city = cityEntity;

          return newDistrict;
        });
      })
      .flat();

    await provinceRepository.save(districts);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const provinceRepository = queryRunner.manager.getTreeRepository(Province);

    await provinceRepository.clear();
  }
}
