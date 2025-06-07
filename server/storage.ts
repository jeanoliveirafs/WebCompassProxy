import { 
  navigationHistory, 
  scripts, 
  type NavigationHistory, 
  type InsertNavigationHistory,
  type Script,
  type InsertScript 
} from "@shared/schema";

export interface IStorage {
  // Navigation History
  getNavigationHistory(): Promise<NavigationHistory[]>;
  addNavigationHistory(entry: InsertNavigationHistory): Promise<NavigationHistory>;
  deleteNavigationHistory(id: number): Promise<void>;
  clearNavigationHistory(): Promise<void>;
  
  // Scripts
  getScripts(): Promise<Script[]>;
  getScript(id: number): Promise<Script | undefined>;
  createScript(script: InsertScript): Promise<Script>;
  updateScript(id: number, script: Partial<InsertScript>): Promise<Script | undefined>;
  deleteScript(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private navigationHistoryData: Map<number, NavigationHistory>;
  private scriptsData: Map<number, Script>;
  private currentHistoryId: number;
  private currentScriptId: number;

  constructor() {
    this.navigationHistoryData = new Map();
    this.scriptsData = new Map();
    this.currentHistoryId = 1;
    this.currentScriptId = 1;
    
    // Add some default scripts
    this.seedDefaultScripts();
  }

  private seedDefaultScripts() {
    const defaultScripts: InsertScript[] = [
      {
        name: "Extract Headers",
        description: "Extract all heading elements from the page",
        content: `// Extract all heading elements
function extractHeaders() {
  const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const result = [];
  
  headers.forEach(header => {
    result.push({
      tag: header.tagName,
      text: header.textContent.trim(),
      id: header.id || null,
      classes: header.className || null
    });
  });
  
  return result;
}

return extractHeaders();`
      },
      {
        name: "Form Filler",
        description: "Auto-fill common form fields with test data",
        content: `// Auto-fill form fields
function fillForm() {
  const emailInputs = document.querySelectorAll('input[type="email"], input[name*="email"]');
  const passwordInputs = document.querySelectorAll('input[type="password"], input[name*="password"]');
  const nameInputs = document.querySelectorAll('input[name*="name"], input[placeholder*="name"]');
  
  emailInputs.forEach(input => {
    input.value = 'test@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  passwordInputs.forEach(input => {
    input.value = 'password123';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  nameInputs.forEach(input => {
    input.value = 'John Doe';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  
  return 'Form fields filled successfully';
}

return fillForm();`
      },
      {
        name: "Screenshot Elements",
        description: "Highlight and capture specific page elements",
        content: `// Highlight elements for screenshot
function highlightElements(selector = 'img, button, a') {
  const elements = document.querySelectorAll(selector);
  const highlights = [];
  
  elements.forEach((el, index) => {
    el.style.outline = '3px solid #ff0000';
    el.style.outlineOffset = '2px';
    
    highlights.push({
      index: index,
      tagName: el.tagName,
      text: el.textContent?.substring(0, 50) || '',
      src: el.src || null
    });
  });
  
  return {
    message: \`Highlighted \${highlights.length} elements\`,
    elements: highlights
  };
}

return highlightElements();`
      }
    ];

    defaultScripts.forEach(script => {
      const id = this.currentScriptId++;
      const scriptWithId: Script = {
        ...script,
        id,
        createdAt: new Date()
      };
      this.scriptsData.set(id, scriptWithId);
    });
  }

  // Navigation History methods
  async getNavigationHistory(): Promise<NavigationHistory[]> {
    return Array.from(this.navigationHistoryData.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async addNavigationHistory(entry: InsertNavigationHistory): Promise<NavigationHistory> {
    const id = this.currentHistoryId++;
    const historyEntry: NavigationHistory = {
      ...entry,
      id,
      timestamp: new Date()
    };
    this.navigationHistoryData.set(id, historyEntry);
    return historyEntry;
  }

  async deleteNavigationHistory(id: number): Promise<void> {
    this.navigationHistoryData.delete(id);
  }

  async clearNavigationHistory(): Promise<void> {
    this.navigationHistoryData.clear();
  }

  // Scripts methods
  async getScripts(): Promise<Script[]> {
    return Array.from(this.scriptsData.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getScript(id: number): Promise<Script | undefined> {
    return this.scriptsData.get(id);
  }

  async createScript(script: InsertScript): Promise<Script> {
    const id = this.currentScriptId++;
    const scriptWithId: Script = {
      ...script,
      id,
      createdAt: new Date()
    };
    this.scriptsData.set(id, scriptWithId);
    return scriptWithId;
  }

  async updateScript(id: number, script: Partial<InsertScript>): Promise<Script | undefined> {
    const existing = this.scriptsData.get(id);
    if (!existing) return undefined;

    const updated: Script = {
      ...existing,
      ...script
    };
    this.scriptsData.set(id, updated);
    return updated;
  }

  async deleteScript(id: number): Promise<void> {
    this.scriptsData.delete(id);
  }
}

export const storage = new MemStorage();
