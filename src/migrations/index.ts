import * as migration_20260716_170835_initial from './20260716_170835_initial';

export const migrations = [
  {
    up: migration_20260716_170835_initial.up,
    down: migration_20260716_170835_initial.down,
    name: '20260716_170835_initial'
  },
];
