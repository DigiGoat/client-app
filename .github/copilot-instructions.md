# `client-app` Copilot Instructions
This repository (`client-app`), is a part of DigiGoat. "DigiGoat" is a collection of repositories that work together for a common use. For more information about the role of each repository, see `DigiGoat Structure` (take note that any repository mentioned is owned by the DigiGoat organization - `web-ui` refers to `DigiGoat/web`ui`; `client-app` refers to `DigiGoat/client-app`; `DigiGoat.app` refers to `DigiGoat/DigiGoat.app). Once you have identified the relevant repos, be sure to state them in your response. If you are unsure, ask. Once you have determined the relevant repos, if you need to search the remote index or access a different repo than the current via the GitHub mcp, use `Versioning Model` to determine which branch you should be searching for files on. 

When generating ANY content, be sure to adhere to the structure described in `Syntax and Structure`.


## DigiGoat Structure
DigiGoat is a web design product that is made specifically for ADGA registered dairy goat farms. This `client-app` repo is responsible for the app that maintains the websites and the `web-ui` repo is the repository responsible for having the template that the app fills in. Both repositories use angular and this `client-app` repo also utilizes `electron` to make the angular interface native. The way that the app updates the website is through json files. `web-ui` loads these files during compilation and when loading pages. However, app never directly updates `web-ui`. Instead, it handles repositories that have been forked from it, and uses it as an upstream to pull “updates” from. Forks of `web-ui` use Firebase for hosting, and build/deploy through Github Actions.  The `DigiGoat.app` repository is responsible for all of the user-facing documentation and instructions on how to use “DigiGoat” (the collective product of `web-ui` and `client-app`) - it is hosted at `https://digigoat.app/`. 

## Versioning Model
### IMPORTANT: ONLY CONSIDER THIS WHEN USING THE GITHUB MCP TO DOWNLOAD OTHER REPOSITORIES
All of the repositories have a very strict versioning pipeline. Each repository has 3 branches: main, beta, and development. Development is where changes are committed to. A PR is then opened to merge development into main. It is required that the changeling have updates and that the version increases. Only the development branch may merge into the beta branch, and it must be with a `-beta.x` suffix. Only the beta branch may merge into the main branch. Since the beta branch has to have a beta version, there is a script that runs in every GitHub actions that strips the `-beta.x` suffix off the end of the version. This makes it so that while the main branch will have a beta version in the code, when it is publishing releases it will have a non-beta tag. The only exception to this is the `DigiGoat.app` repo, which just has a development and main branch, which don’t use beta versions. 
These repositories use semantic versioning. Especially `web-ui` and `client-app`. `web-ui` and `client-app` MUST have the same major version, they SHOULD have the same minor version, and patch versions are INDEPENDENT.
I do not expect you, or want you, to update version numbers. I am providing this information so that when you are searching for files, you do so on the correct branch.

## Syntax and Structure
All of these repositories use angular. This repository specifically uses modules, using a different one for each window. It is important to know that when linking to other parts of the app, you MUST use routerlink="" instead of href="", This allows for a more native behavior. If a suggestion can be done using an angular tool rather than a native HTML/JS tool, ALWAYS use the angular tool. If code can be generated via the angular CLI (components, services, modules, etc.), ALWAYS use the angular CLI.

When generating code, be sure to follow the existing code style. This includes but is not limited to: using single quotes for strings, using semicolons at the end of statements, and using 2 spaces for indentation.

This repository supports testing, however it is not enforced. Furthermore, all testing is done through `jest`, NOT `karma`.

When generating HTML, generate custom CSS as minimally as possible. If styling is necessary, use `bootstrap` classes.

If you wish to verify your suggestions, you may run `yarn build` and `yarn lint`. If you choose to run `yarn test`, know that it may fail even if you provided valid suggestions. However, `yarn build` and `yarn lint` should always pass. Don't use tasks (ex. Build.Main), these are used for running debug sessions in VSCode, stick to the yarn commands. Furthermore, VSCode will periodically mark code that is legit under `global.d.ts` as errors - ignore these (this happens for the majority of the `window.electron.x` calls).

## Accesing the DigiGoat Space
If you feel that you need more information about DigiGoat, you can use the Github MCP to download the space "DigiGoat" owned by the DigiGoat organization. It is recommended that you do this before using the Github MCP to access any information from other repositories, as it will give you more context about how the repositories work together.
