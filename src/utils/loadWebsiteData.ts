import websiteData from '../../website-data.json';

export interface PageStructure {
  url?: string;
  title?: string;
  meta?: {
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    canonical?: string;
    [key: string]: any;
  };
  sections?: any[];
  components?: any[];
  [key: string]: any;
}

export interface PageData {
  url: string;
  originalHTML?: string;
  renderedHTML?: string;
  structure?: PageStructure;
  [key: string]: any;
}

export interface AssetData {
  url: string;
  type?: string;
  localPath?: string;
  filename?: string;
  [key: string]: any;
}

export interface WebsiteData {
  pages: PageData[];
  assets: {
    images?: AssetData[];
    css?: AssetData[];
    js?: AssetData[];
    fonts?: AssetData[];
    [key: string]: any;
  };
  structure?: any;
  [key: string]: any;
}

export function getWebsiteData(): WebsiteData {
  return websiteData as WebsiteData;
}

export function getPageByUrl(url: string): PageData | undefined {
  const data = getWebsiteData();
  return data.pages.find(page => 
    page.url === url || 
    page.url.includes(url) || 
    url.includes(page.url.replace(/^https?:\/\//, ''))
  );
}

export function getAllPages(): PageData[] {
  return getWebsiteData().pages;
}

export function getAssets(): WebsiteData['assets'] {
  return getWebsiteData().assets;
}

export function getPageTitle(page: PageData): string {
  return page.structure?.title || page.structure?.meta?.ogTitle || 'Windscribe';
}

export function getPageDescription(page: PageData): string {
  return page.structure?.meta?.description || 
         page.structure?.meta?.ogDescription || 
         'Windscribe VPN';
}

export function getPageOgImage(page: PageData): string | undefined {
  return page.structure?.meta?.ogImage;
}

export function getPageCanonical(page: PageData): string | undefined {
  return page.structure?.meta?.canonical || page.structure?.meta?.ogUrl || page.url;
}
