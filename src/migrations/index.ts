import * as migration_20260716_170835_initial from './20260716_170835_initial';
import * as migration_20260716_180330_urlap_bekuldesek from './20260716_180330_urlap_bekuldesek';

export const migrations = [
  {
    up: migration_20260716_170835_initial.up,
    down: migration_20260716_170835_initial.down,
    name: '20260716_170835_initial',
  },
  {
    up: migration_20260716_180330_urlap_bekuldesek.up,
    down: migration_20260716_180330_urlap_bekuldesek.down,
    name: '20260716_180330_urlap_bekuldesek'
  },
];
