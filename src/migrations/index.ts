import * as migration_20260716_170835_initial from './20260716_170835_initial';
import * as migration_20260716_180330_urlap_bekuldesek from './20260716_180330_urlap_bekuldesek';
import * as migration_20260716_183352_weboldalak_multitenant from './20260716_183352_weboldalak_multitenant';
import * as migration_20260716_204204_media_uzenet_site from './20260716_204204_media_uzenet_site';

export const migrations = [
  {
    up: migration_20260716_170835_initial.up,
    down: migration_20260716_170835_initial.down,
    name: '20260716_170835_initial',
  },
  {
    up: migration_20260716_180330_urlap_bekuldesek.up,
    down: migration_20260716_180330_urlap_bekuldesek.down,
    name: '20260716_180330_urlap_bekuldesek',
  },
  {
    up: migration_20260716_183352_weboldalak_multitenant.up,
    down: migration_20260716_183352_weboldalak_multitenant.down,
    name: '20260716_183352_weboldalak_multitenant',
  },
  {
    up: migration_20260716_204204_media_uzenet_site.up,
    down: migration_20260716_204204_media_uzenet_site.down,
    name: '20260716_204204_media_uzenet_site'
  },
];
