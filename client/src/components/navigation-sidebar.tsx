import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  History, 
  Search, 
  Trash2, 
  Camera,
  ExternalLink,
  Clock,
  AlertCircle
} from "lucide-react";
import { useProxy } from "@/hooks/use-proxy";
import { NavigationHistory } from "@shared/schema";

interface NavigationSidebarProps {
  onNavigateToUrl: (url: string) => void;
}

export function NavigationSidebar({ onNavigateToUrl }: NavigationSidebarProps) {
  const { history, clearHistory, isLoadingHistory } = useProxy();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter((item: NavigationHistory) =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 300 && statusCode < 400) return "bg-yellow-500";
    if (statusCode >= 400) return "bg-red-500";
    return "bg-gray-500";
  };

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return Globe;
    if (statusCode >= 400) return AlertCircle;
    return Globe;
  };

  return (
    <div className="w-80 bg-card border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">WebCompass</h1>
              <p className="text-xs text-muted-foreground">Advanced Web Proxy</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Sessions</div>
            <div className="text-lg font-semibold">{history.length}</div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3">
            <div className="text-xs text-muted-foreground">Success Rate</div>
            <div className="text-lg font-semibold">
              {history.length > 0 ? 
                Math.round((history.filter(h => h.statusCode >= 200 && h.statusCode < 400).length / history.length) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Navigation History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium flex items-center">
              <History className="w-4 h-4 mr-2" />
              Navigation History
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearHistory()}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {isLoadingHistory ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No matching history found" : "No navigation history yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item) => {
                const StatusIcon = getStatusIcon(item.statusCode);
                
                return (
                  <div
                    key={item.id}
                    className="group cursor-pointer p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-transparent hover:border-border"
                    onClick={() => onNavigateToUrl(item.url)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <StatusIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <Badge 
                            variant="outline" 
                            className={`w-2 h-2 rounded-full p-0 ${getStatusColor(item.statusCode)}`}
                          />
                          <span className="text-xs text-muted-foreground">
                            {item.statusCode}
                          </span>
                        </div>
                        
                        <div className="text-sm font-medium truncate">
                          {item.title || "Untitled Page"}
                        </div>
                        
                        <div className="text-xs text-muted-foreground truncate mt-1">
                          {item.url}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(item.timestamp)}
                          </div>
                          
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.screenshotPath && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Camera className="w-3 h-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {item.responseTime && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Response: {item.responseTime}ms
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-muted-foreground">Server Connected</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Port 5000 • Ready for requests
        </div>
      </div>
    </div>
  );
}
