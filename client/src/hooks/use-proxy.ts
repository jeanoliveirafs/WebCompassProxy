import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proxyApi } from "@/lib/proxy-api";
import { useToast } from "@/hooks/use-toast";

export function useProxy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["/api/proxy/history"],
    queryFn: proxyApi.getHistory,
  });

  const scriptsQuery = useQuery({
    queryKey: ["/api/scripts"],
    queryFn: proxyApi.getScripts,
  });

  const navigateMutation = useMutation({
    mutationFn: proxyApi.navigate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/history"] });
      toast({
        title: "Navigation successful",
        description: "Page loaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Navigation failed",
        description: error.message || "Failed to navigate to the URL",
        variant: "destructive",
      });
    },
  });

  const screenshotMutation = useMutation({
    mutationFn: proxyApi.takeScreenshot,
    onSuccess: () => {
      toast({
        title: "Screenshot captured",
        description: "Screenshot saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Screenshot failed",
        description: error.message || "Failed to capture screenshot",
        variant: "destructive",
      });
    },
  });

  const contentMutation = useMutation({
    mutationFn: proxyApi.extractContent,
    onSuccess: () => {
      toast({
        title: "Content extracted",
        description: "Page content extracted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract content",
        variant: "destructive",
      });
    },
  });

  const scriptMutation = useMutation({
    mutationFn: proxyApi.injectScript,
    onSuccess: () => {
      toast({
        title: "Script executed",
        description: "Script ran successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Script failed",
        description: error.message || "Failed to execute script",
        variant: "destructive",
      });
    },
  });

  const createScriptMutation = useMutation({
    mutationFn: proxyApi.createScript,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Script saved",
        description: "Script created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save script",
        variant: "destructive",
      });
    },
  });

  const deleteScriptMutation = useMutation({
    mutationFn: proxyApi.deleteScript,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({
        title: "Script deleted",
        description: "Script removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete script",
        variant: "destructive",
      });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: proxyApi.clearHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proxy/history"] });
      toast({
        title: "History cleared",
        description: "Navigation history cleared successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clear failed",
        description: error.message || "Failed to clear history",
        variant: "destructive",
      });
    },
  });

  return {
    history: historyQuery.data || [],
    scripts: scriptsQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    isLoadingScripts: scriptsQuery.isLoading,
    navigate: navigateMutation.mutate,
    takeScreenshot: screenshotMutation.mutate,
    extractContent: contentMutation.mutate,
    executeScript: scriptMutation.mutate,
    createScript: createScriptMutation.mutate,
    deleteScript: deleteScriptMutation.mutate,
    clearHistory: clearHistoryMutation.mutate,
    isNavigating: navigateMutation.isPending,
    isCapturing: screenshotMutation.isPending,
    isExtracting: contentMutation.isPending,
    isExecuting: scriptMutation.isPending,
    screenshotResult: screenshotMutation.data,
    navigationResult: navigateMutation.data,
    contentResult: contentMutation.data,
    scriptResult: scriptMutation.data,
  };
}
