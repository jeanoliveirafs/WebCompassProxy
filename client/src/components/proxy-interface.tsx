import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useProxy } from "@/hooks/use-proxy";
import { NavigationSidebar } from "./navigation-sidebar";
import { ContentViewer } from "./content-viewer";
import { ScriptEditor } from "./script-editor";
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Camera, 
  Code,
  Globe,
  Settings,
  Sun,
  Moon
} from "lucide-react";
import { useTheme } from "next-themes";

export function ProxyInterface() {
  const [currentUrl, setCurrentUrl] = useState("https://example.com");
  const [inputUrl, setInputUrl] = useState("https://example.com");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  
  const {
    navigate,
    takeScreenshot,
    extractContent,
    executeScript,
    isNavigating,
    isCapturing,
    isExtracting,
    isExecuting,
    navigationResult,
    screenshotResult,
    contentResult,
  } = useProxy();

  const handleNavigate = (url?: string) => {
    const targetUrl = url || inputUrl;
    if (!targetUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    // Ensure URL has protocol
    let formattedUrl = targetUrl;
    if (!formattedUrl.match(/^https?:\/\//)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    setCurrentUrl(formattedUrl);
    setInputUrl(formattedUrl);
    navigate({ url: formattedUrl });
  };

  const handleTakeScreenshot = () => {
    if (!currentUrl) {
      toast({
        title: "No URL",
        description: "Navigate to a page first",
        variant: "destructive",
      });
      return;
    }

    takeScreenshot({ 
      url: currentUrl,
      fullPage: true,
      width: 1920,
      height: 1080
    });
  };

  const handleExtractContent = () => {
    if (!currentUrl) {
      toast({
        title: "No URL",
        description: "Navigate to a page first",
        variant: "destructive",
      });
      return;
    }

    extractContent({ url: currentUrl });
  };

  const handleExecuteScript = (script: string) => {
    if (!currentUrl) {
      toast({
        title: "No URL",
        description: "Navigate to a page first",
        variant: "destructive",
      });
      return;
    }

    executeScript({ script, url: currentUrl });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">WebCompass</h1>
              <span className="bg-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                v2.1.0
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <NavigationSidebar onNavigateToUrl={handleNavigate} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <div className="bg-card border-b px-6 py-3">
            <div className="flex items-center space-x-3 mb-4">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" disabled>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleNavigate(currentUrl)}
                  disabled={isNavigating}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* URL Input */}
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter URL to navigate..."
                  className="pl-10 pr-16"
                />
                <Button
                  size="sm"
                  onClick={() => handleNavigate()}
                  disabled={isNavigating}
                  className="absolute right-2 top-1.5"
                >
                  {isNavigating ? "Loading..." : "Go"}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleTakeScreenshot}
                  disabled={!currentUrl || isCapturing}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {isCapturing ? "Capturing..." : "Screenshot"}
                </Button>
                <Button
                  onClick={handleExtractContent}
                  disabled={!currentUrl || isExtracting}
                  variant="secondary"
                >
                  <Code className="w-4 h-4 mr-2" />
                  {isExtracting ? "Extracting..." : "Extract"}
                </Button>
              </div>
            </div>

            {/* Status Bar */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="flex items-center text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                  Connected
                </span>
                {navigationResult && (
                  <>
                    <span className="text-muted-foreground">
                      Response: {navigationResult.responseTime}ms
                    </span>
                    <span className="text-muted-foreground">
                      Size: {Math.round(navigationResult.contentSize / 1024)}KB
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden">
            <ContentViewer
              currentUrl={currentUrl}
              screenshotPath={screenshotResult?.screenshotPath}
              isLoading={isNavigating}
              navigationResult={navigationResult}
              screenshotResult={screenshotResult}
              contentResult={contentResult}
            />
            
            <ScriptEditor
              currentUrl={currentUrl}
              onExecuteScript={handleExecuteScript}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-secondary border-t px-6 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-muted-foreground">Server Running</span>
            </div>
            <div className="text-muted-foreground">
              Port 5000 • External IP Ready
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">Memory: 84 MB</span>
            <span className="text-muted-foreground">CPU: 12%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
