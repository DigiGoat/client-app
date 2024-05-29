import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { PublisherGithub } from '@electron-forge/publisher-github';
import type { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerZIP({}, ['darwin']), new MakerRpm({}), new MakerDeb({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'metadot',
        name: 'das-keyboard-q',
      },
      prerelease: true,
    })
  ]
};

export default config;
