import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { PublisherGithub } from '@electron-forge/publisher-github';
import type { ForgeConfig } from '@electron-forge/shared-types';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/AppIcon'
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel(), new MakerDMG({
    icon: './assets/AppIcon.dmg.icns',
  })],
  plugins: [
    new AutoUnpackNativesPlugin({}),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'DigiGoat',
        name: 'client-app',
      },
      draft: true,
    })
  ]
};

export default config;
