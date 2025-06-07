import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  Code, 
  Terminal, 
  Download, 
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface ContentViewerProps {
  currentUrl: string;
  screenshotPath?: string;
  isLoading: boolean;
  error?: string;
  navigationResult?: any;
  screenshotResult?: any;
  contentResult?: any;
}

export function ContentViewer({ 
  currentUrl, 
  screenshotPath, 
  isLoading, 
  error,
  navigationResult,
  screenshotResult,
  contentResult 
}: ContentViewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'console'>('preview');

  const tabs = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'html', label: 'HTML Source', icon: Code },
    { id: 'console', label: 'Console', icon: Terminal },
  ];

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return "bg-gray-500";
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 300 && statusCode < 400) return "bg-yellow-500";
    if (statusCode >= 400) return "bg-red-500";
    return "bg-gray-500";
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col bg-card">
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <Icon className="w-4 h-4 mr-2 inline" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Display */}
      <div className="flex-1 overflow-hidden">
        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="h-full p-6">
            <div className="h-full bg-background rounded-lg border overflow-hidden">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Loading page...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Failed to Load</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      {error}
                    </p>
                    <Button variant="outline">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Page Info Bar */}
                  {navigationResult && (
                    <div className="p-4 border-b bg-secondary/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(navigationResult.statusCode)}`} />
                            <Badge variant="outline">
                              {navigationResult.statusCode}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {navigationResult.responseTime}ms
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatBytes(navigationResult.contentSize)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Screenshot Display */}
                  <div className="flex-1 overflow-auto p-4">
                    {screenshotPath || screenshotResult?.screenshotPath ? (
                      <div className="max-w-none">
                        <img
                          src={screenshotPath || screenshotResult?.screenshotPath}
                          alt="Website screenshot"
                          className="border rounded-lg shadow-lg max-w-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Website Preview</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Navigate to a URL to see the preview
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HTML Source Tab */}
        {activeTab === 'html' && (
          <div className="h-full p-6">
            <div className="h-full bg-slate-900 rounded-lg border overflow-hidden">
              <ScrollArea className="h-full p-4">
                {contentResult?.content ? (
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                    {typeof contentResult.content === 'string' 
                      ? contentResult.content 
                      : JSON.stringify(contentResult.content, null, 2)
                    }
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Code className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        No HTML content available
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Extract content from a page to view source
                      </p>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Console Tab */}
        {activeTab === 'console' && (
          <div className="h-full p-6">
            <div className="h-full bg-slate-900 rounded-lg border overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-2 font-mono text-sm">
                  {navigationResult && (
                    <div className="text-blue-400">
                      [INFO] Navigation completed: {navigationResult.url}
                    </div>
                  )}
                  {navigationResult?.statusCode && (
                    <div className={navigationResult.statusCode >= 200 && navigationResult.statusCode < 300 
                      ? "text-green-400" 
                      : "text-red-400"
                    }>
                      [HTTP] Status: {navigationResult.statusCode}
                    </div>
                  )}
                  {screenshotResult && (
                    <div className="text-green-400">
                      [SUCCESS] Screenshot captured: {screenshotResult.screenshotPath}
                    </div>
                  )}
                  {contentResult && (
                    <div className="text-blue-400">
                      [INFO] Content extracted from: {contentResult.url}
                    </div>
                  )}
                  {error && (
                    <div className="text-red-400">
                      [ERROR] {error}
                    </div>
                  )}
                  
                  {!navigationResult && !screenshotResult && !contentResult && !error && (
                    <div className="text-center py-8">
                      <Terminal className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Console output will appear here
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
