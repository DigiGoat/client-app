/* eslint-disable @typescript-eslint/ban-ts-comment */
// Make sure that the pull request updated the version in the package.json
import axios from 'axios';
//@ts-ignore - chalk isn't broken yet at v4
import chalk from 'chalk';
import { readFile } from 'fs/promises';
import Git from 'simple-git';
//@ts-ignore - This is addressed in the compiler options
import packageJson from '../package.json';

const origin = process.env['BEFORE'];

const ci = !!process.env['CI'];
const log = {
  debug: (...message: unknown[]): void => console.debug(chalk.dim('>', ...message)),
  info: (...message: unknown[]): void => console.log(...message),
  warn: (...message: unknown[]): void => console.warn(`${ci ? '::warning::' : ''}${chalk.yellowBright(...message)}`),
  error: (...message: unknown[]): void => console.error(`${ci ? '::error::' : ''}${chalk.redBright(...message)}`),
  success: (...message: unknown[]): void => console.log(chalk.greenBright(...message))
};
if (!ci) {
  log.error('This workflow may only be run by a pull request!');
  process.exit(1);
}
const git = Git();
const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    Authorization: `token ${process.env['GITHUB_TOKEN']}`,
    'X-GitHub-Api-Version': '2022-11-28'
  }
});

async function getChanges() {
  const oldChangelog = await git.show(`${origin}:CHANGELOG.md`).catch(() => {
    log.warn('The changelog is missing in the base branch');
  });
  log.debug('Old Changelog', oldChangelog);
  const changelog = await readFile('CHANGELOG.md', 'utf-8');
  log.debug('New Changelog', changelog);
  const changes = oldChangelog ? changelog.split('\n').slice(0, changelog.split('\n').length - oldChangelog.split('\n').length).join('\n') : changelog;
  log.info('Changelog changes', changes);
  return changes;
}

/*What needs to be done:
get the version
find the release with the corresponding tag version
use the id of that release to update the release
  update the body to be all of the changes in the changelog since the push
  set prerelease based off of wether running in the beta or main branch
  set draft to false
*/
(async (): Promise<void> => {
  log.info('Getting version');
  const { version } = packageJson;
  log.debug('Version:', version);
  log.info('Getting releases');
  const { data: releases } = await github.get('/repos/digigoat/client-app/releases');
  const release = releases.find((r: { name: string; }) => r.name === `v${version}`);
  if (!release) {
    log.error(`Release ${version} not found`);
    process.exit(1);
  }
  const { tag_name: tag, id: releaseId } = release;
  log.info(`Found release ${tag} with id ${releaseId}`);
  log.info('Getting changes');
  const changes = await getChanges();
  log.debug('Changes:', changes);
  //Get the releases assets and delete two, one ending with .nupkg, and another titled RELEASES
  log.info('Deleting old assets');
  const { data: assets } = await github.get(`/repos/digigoat/client-app/releases/${releaseId}/assets`);
  for (const { name, id } of assets) {
    if (name.endsWith('.nupkg') || name === 'RELEASES') {
      await github.delete(`/repos/${process.env['GITHUB_REPOSITORY']}/releases/assets/${id}`);
      log.info(`Deleted asset ${name}`);
    }
  }
  log.info('Publishing Release');
  await github.patch(`/repos/${process.env['GITHUB_REPOSITORY']}/releases/${releaseId}`, {
    body: process.env['GITHUB_REF_NAME'] === 'main' ? `# v${version}\n${changes}` : changes,
    draft: false,
    tag_name: tag,
    prerelease: process.env['GITHUB_REF_NAME'] === 'beta'
  });
  log.success('Updated release');
})();
