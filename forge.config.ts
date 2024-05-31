import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { PublisherGithub } from '@electron-forge/publisher-github';
import type { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({}), new MakerDMG({})],
  plugins: [
    new AutoUnpackNativesPlugin({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'DigiGoat',
        name: 'client-app',
      },
      prerelease: true,
    })
  ]
};

export default config;
