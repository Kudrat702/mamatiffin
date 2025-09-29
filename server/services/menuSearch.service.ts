import { MenuDetails } from '../models/menuDetails';
import { MENU_CONFIG } from '../config/menu.config';
import { SearchResult } from '../types/menu.types';

type AllowedCategory = 'veg' | 'non-veg';

export class MenuSearchService {
  private cache = new Map<string, { data: any; timestamp: number }>();

  private sanitizeInput(input: string): string {
    return input.replace(/[^\w\s-+]/g, '').trim().substring(0, MENU_CONFIG.MAX_SEARCH_LENGTH);
  }

  private getCacheKey(category: AllowedCategory, searchTerm: string): string {
    return `${category}:${searchTerm}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < MENU_CONFIG.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private generateSearchPatterns(category: string): string[] {
    const sanitized = this.sanitizeInput(category);

    return [
      sanitized,
      sanitized.replace(/-/g, ' '),
      sanitized.replace(/-/g, '+'),
      sanitized.replace(/-/g, ' + '),
      sanitized.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' + '),
      sanitized.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      sanitized.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('-'),
      sanitized.toUpperCase().replace(/-/g, ' '),
      sanitized.toLowerCase().replace(/-/g, ' ')
    ].filter((pattern, index, self) => self.indexOf(pattern) === index); // Remove duplicates
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private async exactMatch(diet: AllowedCategory, patterns: string[]): Promise<any> {
    for (const pattern of patterns) {
      const result = await MenuDetails.findOne({
        category: diet,
        menuType: pattern
      }).lean();

      if (result) {
        console.log(`✅ Found exact match: "${pattern}"`);
        return result;
      }
    }
    return null;
  }

  private async regexMatch(diet: AllowedCategory, patterns: string[]): Promise<any> {
    for (const pattern of patterns) {
      const escapedPattern = this.escapeRegex(pattern);
      const result = await MenuDetails.findOne({
        category: diet,
        menuType: { $regex: `^${escapedPattern}$`, $options: 'i' }
      }).lean();

      if (result) {
        console.log(`✅ Found regex match: "${result.menuType}"`);
        return result;
      }
    }
    return null;
  }

  private async flexibleMatch(diet: AllowedCategory, category: string): Promise<any> {
    const words = this.sanitizeInput(category).split('-');
    const flexibleRegex = words.map(word => `(?=.*${this.escapeRegex(word)})`).join('');

    const result = await MenuDetails.findOne({
      category: diet,
      menuType: { $regex: flexibleRegex, $options: 'i' }
    }).lean();

    if (result) {
      console.log(`✅ Found flexible match: "${result.menuType}"`);
    }
    return result;
  }

  private async partialMatch(diet: AllowedCategory, category: string): Promise<any> {
    const words = this.sanitizeInput(category).split('-');
    const orConditions = words.map(word => ({
      menuType: { $regex: this.escapeRegex(word), $options: 'i' }
    }));

    const result = await MenuDetails.findOne({
      category: diet,
      $or: orConditions
    }).lean();

    if (result) {
      console.log(`✅ Found partial match: "${result.menuType}"`);
    }
    return result;
  }

  private async fuzzyMatch(diet: AllowedCategory, category: string): Promise<any> {
    const allMenus = await MenuDetails.find({ category: diet }).lean();

    if (allMenus.length === 0) return null;

    const searchWords = this.sanitizeInput(category).toLowerCase().split('-');

    const fuzzyMatch = allMenus.find(menu => {
      const menuWords = menu.menuType.toLowerCase().split(/[\s+\-_]+/);

      const matchCount = searchWords.filter(searchWord =>
        menuWords.some(menuWord =>
          menuWord.includes(searchWord) ||
          searchWord.includes(menuWord) ||
          (menuWord.length >= 3 && searchWord.startsWith(menuWord.substring(0, 3))) ||
          (searchWord.length >= 3 && menuWord.startsWith(searchWord.substring(0, 3)))
        )
      ).length;

      return matchCount >= Math.ceil(searchWords.length * MENU_CONFIG.FUZZY_MATCH_THRESHOLD);
    });

    if (fuzzyMatch) {
      console.log(`✅ Found fuzzy match: "${fuzzyMatch.menuType}"`);
    }
    return fuzzyMatch;
  }

  async searchMenu(diet: AllowedCategory, category: string): Promise<SearchResult> {
    try {
      const cacheKey = this.getCacheKey(diet, category);
      const cached = this.getFromCache(cacheKey);

      if (cached) {
        console.log('✅ Found in cache');
        return { found: true, data: cached, matchType: 'cache' };
      }

      console.log(`🔍 Searching for menu: ${diet} - ${category}`);

      const searchPatterns = this.generateSearchPatterns(category);
      console.log('🔍 Search patterns:', searchPatterns);

      // Try different search strategies in order of preference
      let menuData = await this.exactMatch(diet, searchPatterns);
      if (menuData) {
        this.setCache(cacheKey, menuData);
        return { found: true, data: menuData, matchType: 'exact' };
      }

      menuData = await this.regexMatch(diet, searchPatterns);
      if (menuData) {
        this.setCache(cacheKey, menuData);
        return { found: true, data: menuData, matchType: 'regex' };
      }

      menuData = await this.flexibleMatch(diet, category);
      if (menuData) {
        this.setCache(cacheKey, menuData);
        return { found: true, data: menuData, matchType: 'flexible' };
      }

      menuData = await this.partialMatch(diet, category);
      if (menuData) {
        this.setCache(cacheKey, menuData);
        return { found: true, data: menuData, matchType: 'partial' };
      }

      menuData = await this.fuzzyMatch(diet, category);
      if (menuData) {
        this.setCache(cacheKey, menuData);
        return { found: true, data: menuData, matchType: 'fuzzy' };
      }

      console.log(`❌ No menu found for: ${diet} - ${category}`);
      return { found: false };

    } catch (error) {
      console.error('💥 Error in menu search:', error);
      throw error;
    }
  }

  async getAvailableMenus(diet: AllowedCategory): Promise<any[]> {
    const cacheKey = `available:${diet}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      return cached;
    }

    const menus = await MenuDetails.find({ category: diet }).lean();
    this.setCache(cacheKey, menus);
    return menus;
  }

  clearCache(): void {
    this.cache.clear();
  }
}