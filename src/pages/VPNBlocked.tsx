import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const VPNBlocked = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            VPN Traffic Not Allowed
          </CardTitle>
          <CardDescription className="text-center">
            For the safety of our community, VPN traffic is not permitted on this site.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-left text-sm">
              <p className="font-medium mb-1">Please turn off your VPN</p>
              <p className="text-muted-foreground">
                Disable your VPN connection and refresh this page to access the site.
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This security measure helps us maintain a safe and trustworthy environment for all community members.
            </p>
            
            <Button 
              onClick={handleRefresh}
              className="w-full"
              size="lg"
            >
              I've Turned Off My VPN - Refresh Page
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              If you believe this is an error, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};