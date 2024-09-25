import { ipcRenderer } from 'electron';
import type { GoatService as GoatServiceType } from '../../../../../../shared/services/goat/goat.service';

export const GoatService: GoatServiceType = {
  getDoes: () => ipcRenderer.invoke('goat:getDoes'),
  setDoes: (does) => ipcRenderer.invoke('goat:setDoes', does),
  onDoesChange: (callback) => ipcRenderer.on('goat:doesChange', (_event, does) => callback(does)),
  getBucks: () => ipcRenderer.invoke('goat:getBucks'),
  setBucks: (bucks) => ipcRenderer.invoke('goat:setBucks', bucks),
  onBucksChange: (callback) => ipcRenderer.on('goat:bucksChange', (_event, bucks) => callback(bucks)),
  getRelated: () => ipcRenderer.invoke('goat:getRelated'),
  setRelated: (related) => ipcRenderer.invoke('goat:setRelated', related),
  onRelatedChange: (callback) => ipcRenderer.on('goat:relatedChange', (_event, related) => callback(related)),
  getKiddingSchedule: () => ipcRenderer.invoke('goat:getKiddingSchedule'),
  setKiddingSchedule: (kiddingSchedule) => ipcRenderer.invoke('goat:setKiddingSchedule', kiddingSchedule),
  onKiddingScheduleChange: (callback) => ipcRenderer.on('goat:kiddingScheduleChange', (_event, kiddingSchedule) => callback(kiddingSchedule)),
};
