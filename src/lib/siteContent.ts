import yaml from 'js-yaml';
import configRaw from '../../config.yml?raw';
import dataRaw from '../../data.yml?raw';
import publicationList from '../generated/publications.json';
import type {PublicationEntry, SiteConfig, SiteData} from '../types/site';

export const siteConfig = yaml.load(configRaw) as SiteConfig;
export const siteData = yaml.load(dataRaw) as SiteData;
export const publicationEntries = publicationList as PublicationEntry[];
