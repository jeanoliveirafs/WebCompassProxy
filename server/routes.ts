import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { 
  insertNavigationHistorySchema, 
  insertScriptSchema,
  scriptExecutionSchema 
} from "@shared/schema";

let browser: any = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  return browser;
}

const navigateSchema = z.object({
  url: z.string().url(),
});

const screenshotSchema = z.object({
  url: z.string().url(),
  fullPage: z.boolean().optional().default(true),
  width: z.number().optional().default(1920),
  height: z.number().optional().default(1080),
});

const contentExtractionSchema = z.object({
  url: z.string().url(),
  selector: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Navigate to URL
  app.post("/api/proxy/navigate", async (req, res) => {
    try {
      const { url } = navigateSchema.parse(req.body);
      const startTime = Date.now();
      
      const browser = await getBrowser();
      const page = await browser.newPage();
      
      await page.setViewport({ width: 1920, height: 1080 });
      
      const response = await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      const responseTime = Date.now() - startTime;
      const title = await page.title();
      const statusCode = response?.status() || 0;
      
      // Get content size estimation
      const content = await page.content();
      const contentSize = Buffer.byteLength(content, 'utf8');
      
      await page.close();
      
      // Save to history
      const historyEntry = await storage.addNavigationHistory({
        url,
        title,
        responseTime,
        statusCode,
        contentSize,
        screenshotPath: null
      });
      
      res.json({
        url,
        title,
        responseTime,
        statusCode,
        contentSize,
        historyId: historyEntry.id
      });
      
    } catch (error: any) {
      console.error('Navigation error:', error);
      res.status(500).json({ 
        error: 'Navigation failed', 
        message: error.message 
      });
    }
  });

  // Take screenshot
  app.post("/api/proxy/screenshot", async (req, res) => {
    try {
      const { url, fullPage, width, height } = screenshotSchema.parse(req.body);
      
      const browser = await getBrowser();
      const page = await browser.newPage();
      
      await page.setViewport({ width, height });
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Create screenshots directory if it doesn't exist
      const screenshotsDir = path.join(process.cwd(), 'dist', 'screenshots');
      await fs.mkdir(screenshotsDir, { recursive: true });
      
      const filename = `screenshot-${Date.now()}.png`;
      const filepath = path.join(screenshotsDir, filename);
      
      await page.screenshot({ 
        path: filepath, 
        fullPage,
        type: 'png'
      });
      
      await page.close();
      
      // Update history entry if exists
      const screenshotPath = `/screenshots/${filename}`;
      
      res.json({
        screenshotPath,
        message: 'Screenshot captured successfully'
      });
      
    } catch (error: any) {
      console.error('Screenshot error:', error);
      res.status(500).json({ 
        error: 'Screenshot failed', 
        message: error.message 
      });
    }
  });

  // Extract content
  app.post("/api/proxy/content", async (req, res) => {
    try {
      const { url, selector } = contentExtractionSchema.parse(req.body);
      
      const browser = await getBrowser();
      const page = await browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      let content;
      if (selector) {
        content = await page.evaluate((sel: string) => {
          const elements = document.querySelectorAll(sel);
          return Array.from(elements).map(el => ({
            tagName: el.tagName,
            textContent: el.textContent?.trim(),
            innerHTML: el.innerHTML,
            attributes: Array.from(el.attributes).reduce((acc: Record<string, string>, attr: Attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {} as Record<string, string>)
          }));
        }, selector);
      } else {
        content = await page.content();
      }
      
      await page.close();
      
      res.json({
        url,
        selector: selector || 'html',
        content,
        extractedAt: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('Content extraction error:', error);
      res.status(500).json({ 
        error: 'Content extraction failed', 
        message: error.message 
      });
    }
  });

  // Inject and execute script
  app.post("/api/proxy/inject", async (req, res) => {
    try {
      const { script, url } = scriptExecutionSchema.parse(req.body);
      
      const browser = await getBrowser();
      const page = await browser.newPage();
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Inject and execute the script
      const result = await page.evaluate((scriptCode: string) => {
        try {
          // Create a function wrapper to execute the script
          const scriptFunction = new Function(scriptCode);
          return scriptFunction();
        } catch (error: any) {
          return { error: error.message };
        }
      }, script);
      
      await page.close();
      
      res.json({
        url,
        script: script.substring(0, 100) + (script.length > 100 ? '...' : ''),
        result,
        executedAt: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error('Script injection error:', error);
      res.status(500).json({ 
        error: 'Script injection failed', 
        message: error.message 
      });
    }
  });

  // Get navigation history
  app.get("/api/proxy/history", async (req, res) => {
    try {
      const history = await storage.getNavigationHistory();
      res.json(history);
    } catch (error: any) {
      console.error('History retrieval error:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve history', 
        message: error.message 
      });
    }
  });

  // Clear navigation history
  app.delete("/api/proxy/history", async (req, res) => {
    try {
      await storage.clearNavigationHistory();
      res.json({ message: 'History cleared successfully' });
    } catch (error: any) {
      console.error('History clear error:', error);
      res.status(500).json({ 
        error: 'Failed to clear history', 
        message: error.message 
      });
    }
  });

  // Script management routes
  app.get("/api/scripts", async (req, res) => {
    try {
      const scripts = await storage.getScripts();
      res.json(scripts);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve scripts', message: error.message });
    }
  });

  app.post("/api/scripts", async (req, res) => {
    try {
      const scriptData = insertScriptSchema.parse(req.body);
      const script = await storage.createScript(scriptData);
      res.json(script);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create script', message: error.message });
    }
  });

  app.delete("/api/scripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScript(id);
      res.json({ message: 'Script deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete script', message: error.message });
    }
  });

  // Serve screenshots
  app.use('/screenshots', (req, res, next) => {
    const filepath = path.join(process.cwd(), 'dist', 'screenshots', req.path);
    res.sendFile(filepath, (err) => {
      if (err) {
        res.status(404).json({ error: 'Screenshot not found' });
      }
    });
  });

  const httpServer = createServer(app);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    if (browser) {
      await browser.close();
    }
  });

  return httpServer;
}
