// Este modulo js debera permitir probar la integridad del funcionamiento del cajero.js y/o backup.js


// importaciones necesarias
// No creadas por mi
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import sqlite3 from 'sqlite3';
import keypress from 'keypress';

// importaciones creadas por mi
import cajero from './cajero.js';
import backup from './backup.js';

