## 5.3.5-beta.1
* Improved Markdown rendering
  * It now uses the built-in compiler to immediately show a rendered output, then it updates it with the gfm once downloaded

## 5.3.4-beta.1
* Fixed a bug causing drag-and-drop to not work for uploading images

## 5.3.3-beta.1
* Fixed a bug causing related goats to not be synced for goats for sale

## 5.3.2-beta.11
* Added the ability to stop the live preview once the server is starting (instead of having to wait until it fully boots)

## 5.3.2-beta.10
* Users are now warned if dependencies need to be installed as it takes a while to install them
* Improved the progress bar when starting the live preview
* Fixed a bug causing the preview not to quit on Mac

## 5.3.2-beta.9
* Updated the Live Preview parsing to use built-in functions

## 5.3.2-beta.8
* Enhanced the parsing of the Live Preview logs on Windows

## 5.3.2-beta.7
* Updated how the app detects if the live preview is running
  * This will fix a bug causing the window to remain open on Windows

## 5.3.2-beta.6
* Hopefully fixed a bug causing the live preview to not quit after closing it on Windows

## 5.3.2-beta.5
* Added a progress bar while the live preview is loading
* implemented a temporary fix for the live preview only working once per boot on Windows

## 5.3.2-beta.4
* Fixed a bug causing the live preview to not work on Windows
  * The good news is it was actually working, it just didn't know it

## 5.3.2-beta.3
* Hopefully fixed the bug preventing the live preview from working on Windows

## 5.3.2-beta.2
* Some backend changes to make it easier to debug the app on Windows

## 5.3.2-beta.1
* Added Support for the Live Preview!

## 5.3.1-beta.3
* Fixed a bug that would cause images to sometimes not be inserted correctly on Windows

## 5.3.1-beta.2
* Fixed a bug that would cause images added to not show up as unsaved changes

## 5.3.1-beta.1
* Added the ability to upload images! This is currently supported on the homepage and in the sale terms popup
  * Let me know if you would like this feature added to other areas of the website

## 5.3.0-beta.1
* Added Death Dates to Goats that are deceased

## 5.2.0-beta.1
* Added support for Awards!
* Significant improvements to the Title Case algorithm

## 5.1.0-beta.1
* Simplified the farm names required to be configured. Instead of a menubar, home, and tab name, there is now just a full name and a short name

## 5.0.2-beta.1
* Added a fallback markdown compiler for when the GitHub API rate limit is reached or you are offline

## 5.0.1-beta.1
* Added a gender dropdown for unregistered goats
* Added suggestions when looking up a goat's dam or sire
* Added a dropdown for goats for sale to specify them as pets
* Added the ability to specify a price for goats for sale
* Added the ability to specify sale terms for goats for sale

## 5.0.0-beta.1
* Added support for a For Sale page
  * TODO: Add a designated price section and sale terms popup

## 4.1.5-beta.1
* Fixed a styling issue when scrolling through the kidding schedule

## 4.1.5-beta.1
* Added the ability to customize the text at the top of the kidding schedule

## 4.1.4-beta.1
* Fixed a bug that caused related goats not to be fetched for references (currently currently fetches related goats for references even if the references page is disabled)

## 4.1.3-beta.1
* Updated the history page so that it will automatically refresh when changes are detected

## 4.1.2-beta.3
* Updated Electron Forge to v7.6 to comply with Electron v34

## 4.1.2-beta.2
* Updated Electron to v34
* Updated Node.js to v20.11

## 4.1.2-beta.1
* A lot of behind-the-scenes changes to improve the performance & security of the app
  * Updated Angular from v17 to v19
  * Updated Typescript
  * Preparing to update Node.js
  * Preparing to update Electron

## 4.1.1-beta.1
* Fixed a bug that would cause the search results for adding a goat to be hidden

## 4.1.0-beta.1
* The kidding schedule now acceses reference goats when identifying dams and sires
  * This currently works even if you have disabled the references page on your site, that behavior may change in the future

## 4.0.0-beta.1
* Added Support for references!
  * This is intended for animals that are not in the herd but are related to the herd (animals you have on lease, deceased animals that still have a genetic impact on your herd, etc.)

## 3.2.0-beta.2
* Fixed a bug causing changes to be lost when saving too much at a time on Windows

## 3.2.0-beta.1
* Added Support To Sync Linear Appraisals!
  * Currently, you can only sync appraisals from ADGA, manual entry will be added in the future

## 3.1.1-beta.1
* Redesigned the windows for editing goats
  * It's now easier to modify the goats info without it being overidden by the next sync
  * You can now edit the capatalization of the name and owner of related goats

## 3.1.0-beta.1
* Added support for socials!
  * This currently includes [Facebook](https://facebook.com), [Instagram](https://instagram.com), and [Threads](https://threads.net)

## 3.0.2-beta.1
* Fixed the kidding schedule suggesting `Invalid Date` if the date bred or due are not proper dates
* Updated the kidding schedule to show the gestation duration for the due & kidded dates

## 3.0.1-beta.3
* Added a loading animation to the history page
* Fixed the local changes section showing up even if there are no changes

## 3.0.1-beta.1
* Added a History tab!

## 3.0.0-beta.6
* Fixed a bug causing the kidding schedule to not show dates if the date is invalid

## 3.0.0-beta.5
* Reverted some unnessacary changes from the previous version

## 3.0.0-beta.4
* Fixed a bug causing the kidding schedule to not save any info within the breedings

## 3.0.0-beta.3
* Increased the height of the breedings so that more can be seen at a time

## 3.0.0-beta.2
* Added a separator before the 'Add "x" To Dictionary' menu item

## 3.0.0-beta.1
* Added support for a Kidding Schedule!
  * Includes a built-in gestation calculator (currently uses 145 days for Nigerian Dwarfs & 150 days for all other breeds)
  * Displays the age of your doe when was bred & is due

## 2.1.14-beta.1
* Fixed the version reported when installing web-ui updates

## 2.1.13-beta.1
* Added support for spell check!

## 2.1.12-beta.1
* Fixed a bug on Mac caused by Apple updating their license agreement

## 2.1.11-beta.1
* Added a Markdown indicator when text will be rendered as Markdown (clicking on it opens the formatting docs)

## 2.1.10-beta.1
* Fixed a bug causing the commit assosciated with releases to be unrelated

## 2.1.9-beta.2
* Fixed a bug when calculating the progress while publishing
  * The progress bar also appears for 1 second after publishing

## 2.1.9-beta.1
* Improved the publish button progress bar
* Fixed a bug caused by clicking links in your goat's descriptions

## 2.1.8-beta.1
* Moved the `Switch Website's` button to the settings page
* Made the ID Blacklist hidden by default

## 2.1.7-beta.1
* Improved the publish button!
  * The publish button now shows a progress bar when publishing
  * It is better at handling errors

## 2.1.6-beta.1
* Fixed a bug causing changes not to be detected when importing a favicon
* Updated TitleCase Algorithm
  * Added RiseUpFromTheAsh, 8SR, LikeA, and FamFarm

## 2.1.5-beta.1
* Added support for Markdown!
  * When configuring your home description or a goat's description, the app will preview the markdown (NOTE: Requests are limited to 60 per hour! However, if you publish during this time, it will still be rendered.)

## 2.1.4-beta.2
* Moved documentation to https://github.com/DigiGoat 
* When quitting the app with unsaved changes, the app will finish quitting after displaying dialog

## 2.1.4-beta.1
* Added missing photos for README

## 2.1.3-beta.7
* Added a README for documentation!

## 2.1.3-beta.6
* Added a warning dialog when deleting a goat

## 2.1.3-beta.5
* Added The Ability To Add Images Via Drag + Drop!

## 2.1.3-beta.4
* Proper implementation of `2.1.3-beta.3`

## 2.1.3-beta.3
* Images now retain their file extension

## 2.1.3-beta.2
* Fixed a bug causing the app to crash on windows when adding images to goats

## 2.1.3-beta.1
* Added the ability to select a primary image for a goat
  * This is the image that will be displayed on the does/bucks page

## 2.1.2-beta.1
* Added the ability to rearrange goats!
* Fixed a bug causing the dropdown showing goat search results to be hidden

## 2.1.1-beta.1
* Added Support To Download Images From A Link!

## 2.1.0-beta.1
* Added owner accounts to related does

## 2.0.0-beta.1
* Added related goats!
  * This allows you to have a pedigree for your does and bucks
* Fixed a very rare bug that would cause a minor crash when deleting a goat
* When syncing, goats are now ordered from oldest to youngest (originally it was youngest to oldest)
* Updated Name Parser
* App now catches rare error caused by a git hangup and restarts
* When syncing, goats now show up in the list quicker (before they are all synced individually)

## 1.0.2-beta.1
* Fixed a bug when versioning on windows

## 1.0.1-beta.1
* Starting to investigate a bug that results in an incorrect version being reported by the pre-check

## 1.0.0-beta.5
* Fixed a bug causing no changes to be displayed under a release

## 1.0.0-beta.4
* Fixed a bug causing the full changelog to be displayed in the release description

## 1.0.0-beta.3
* Fixed some bugs in the release process

## 1.0.0-beta.2
* Fixed some bugs related to the release process

## 1.0.0-beta.1
* The first release of DigiGoat!
