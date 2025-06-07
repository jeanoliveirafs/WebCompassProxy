import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Save, 
  FolderOpen, 
  Copy, 
  Trash2,
  Code2,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react";
import { useProxy } from "@/hooks/use-proxy";
import { Script } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScriptEditorProps {
  currentUrl: string;
  onExecuteScript: (script: string) => void;
}

export function ScriptEditor({ currentUrl, onExecuteScript }: ScriptEditorProps) {
  const { 
    scripts, 
    createScript, 
    deleteScript, 
    isLoadingScripts,
    scriptResult,
    isExecuting 
  } = useProxy();
  
  const [scriptContent, setScriptContent] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [scriptDescription, setScriptDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [outputHistory, setOutputHistory] = useState<Array<{
    timestamp: Date;
    type: 'success' | 'error' | 'info';
    message: string;
  }>>([]);

  useEffect(() => {
    if (scriptResult) {
      setOutputHistory(prev => [{
        timestamp: new Date(),
        type: scriptResult.error ? 'error' : 'success',
        message: scriptResult.error || JSON.stringify(scriptResult.result, null, 2)
      }, ...prev.slice(0, 9)]);
    }
  }, [scriptResult]);

  const handleExecuteScript = () => {
    if (!scriptContent.trim()) return;
    
    setOutputHistory(prev => [{
      timestamp: new Date(),
      type: 'info',
      message: 'Executing script...'
    }, ...prev.slice(0, 9)]);
    
    onExecuteScript(scriptContent);
  };

  const handleSaveScript = () => {
    if (!scriptName.trim() || !scriptContent.trim()) return;
    
    createScript({
      name: scriptName,
      description: scriptDescription,
      content: scriptContent
    });
    
    setScriptName("");
    setScriptDescription("");
    setIsDialogOpen(false);
  };

  const loadScript = (script: Script) => {
    setScriptContent(script.content);
  };

  const getOutputIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'error': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <Clock className="w-3 h-3 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString();
  };

  return (
    <div className="w-96 bg-card border-l flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center">
            <Code2 className="w-4 h-4 mr-2" />
            Script Editor
          </h3>
          <div className="flex items-center space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Script</DialogTitle>
                  <DialogDescription>
                    Save your script for future use
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="script-name">Script Name</Label>
                    <Input
                      id="script-name"
                      value={scriptName}
                      onChange={(e) => setScriptName(e.target.value)}
                      placeholder="Enter script name..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="script-description">Description (Optional)</Label>
                    <Input
                      id="script-description"
                      value={scriptDescription}
                      onChange={(e) => setScriptDescription(e.target.value)}
                      placeholder="Brief description..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveScript}>
                      Save Script
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" size="sm">
              <FolderOpen className="w-3 h-3 mr-1" />
              Load
            </Button>
          </div>
        </div>
      </div>

      {/* Script Editor */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 bg-slate-900 rounded-lg border overflow-hidden mb-4">
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                JavaScript
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => navigator.clipboard.writeText(scriptContent)}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <Textarea
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            placeholder="// Enter your JavaScript code here...
// Example:
function extractData() {
  const links = document.querySelectorAll('a');
  return Array.from(links).map(link => ({
    text: link.textContent,
    href: link.href
  }));
}

return extractData();"
            className="min-h-64 font-mono text-sm bg-slate-900 text-slate-300 border-0 resize-none focus-visible:ring-0"
          />
        </div>

        {/* Script Actions */}
        <div className="space-y-3 mb-4">
          <Button 
            onClick={handleExecuteScript}
            disabled={!scriptContent.trim() || !currentUrl || isExecuting}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? "Executing..." : "Inject & Execute"}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <CheckCircle className="w-3 h-3 mr-1" />
              Validate
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setScriptContent("")}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Script Output */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Console Output</h4>
          <div className="bg-slate-900 rounded-lg border max-h-32 overflow-hidden">
            <ScrollArea className="h-32 p-3">
              {outputHistory.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  Console output will appear here...
                </div>
              ) : (
                <div className="space-y-2">
                  {outputHistory.map((output, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      {getOutputIcon(output.type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">
                          {formatTimestamp(output.timestamp)}
                        </div>
                        <div className="text-xs font-mono text-slate-300 break-all">
                          {output.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Saved Scripts */}
        <div className="flex-1">
          <h4 className="text-sm font-medium mb-2">Saved Scripts</h4>
          <ScrollArea className="h-48">
            {isLoadingScripts ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse p-2 bg-secondary/50 rounded-lg">
                    <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : scripts.length === 0 ? (
              <div className="text-center py-4">
                <Code2 className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No saved scripts yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scripts.map((script) => (
                  <div
                    key={script.id}
                    className="group flex items-center justify-between p-2 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => loadScript(script)}
                    >
                      <div className="text-sm font-medium">{script.name}</div>
                      {script.description && (
                        <div className="text-xs text-muted-foreground">
                          {script.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => loadScript(script)}
                      >
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-destructive"
                        onClick={() => deleteScript(script.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
