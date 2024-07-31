import { readJSONSync, writeJSONSync } from 'fs-extra';

const packageJson = readJSONSync('package.json');
packageJson.version = packageJson.version.split('-')[0];
writeJSONSync('package.json', packageJson, { spaces: 2 });
