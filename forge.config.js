//GENERATED CODE, RUN `yarn rebuild` TO UPDATE

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var maker_dmg_1 = require("@electron-forge/maker-dmg");
var maker_squirrel_1 = require("@electron-forge/maker-squirrel");
var plugin_auto_unpack_natives_1 = require("@electron-forge/plugin-auto-unpack-natives");
var publisher_github_1 = require("@electron-forge/publisher-github");
var config = {
    packagerConfig: {
        asar: {
            unpack: '**/node_modules/{sharp,@img}/**/*'
        },
        icon: './assets/AppIcon'
    },
    rebuildConfig: {},
    makers: [new maker_squirrel_1.MakerSquirrel({
            setupIcon: './assets/AppIcon.setup.ico',
        }), new maker_dmg_1.MakerDMG({
            icon: './assets/AppIcon.dmg.icns',
        })],
    plugins: [
        new plugin_auto_unpack_natives_1.AutoUnpackNativesPlugin({}),
    ],
    publishers: [
        new publisher_github_1.PublisherGithub({
            repository: {
                owner: 'DigiGoat',
                name: 'client-app',
            },
            draft: true,
        })
    ]
};
exports.default = config;
