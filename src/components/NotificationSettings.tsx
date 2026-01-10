import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, BellRing, Loader2, AlertCircle, Check, TrendingUp, CalendarClock, ArrowLeftRight } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    showNotification,
  } = usePushNotifications();

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      toast.success('Push notifications enabled!');
      // Send test notification
      await showNotification('🔔 Notifications Enabled', {
        body: 'You will now receive alerts for price changes, purchases, and transactions.',
      });
    } else if (permission === 'denied') {
      toast.error('Notification permission denied. Please enable in browser settings.');
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      toast.success('Push notifications disabled');
    }
  };

  const handleTestNotification = async () => {
    await showNotification('🧪 Test Notification', {
      body: 'This is a test notification from Perfect Money!',
    });
  };

  if (!isSupported) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <p className="font-medium">Push Notifications Not Supported</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Push Notifications
          {isSubscribed && (
            <Badge variant="outline" className="text-green-500 border-green-500/30">
              <Check className="h-3 w-3 mr-1" />
              Enabled
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Section */}
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <div className="p-2 bg-green-500/10 rounded-lg">
                <BellRing className="h-5 w-5 text-green-500" />
              </div>
            ) : (
              <div className="p-2 bg-muted rounded-lg">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {isSubscribed ? 'Notifications Active' : 'Enable Notifications'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isSubscribed 
                  ? 'You will receive alerts even when the app is closed'
                  : 'Get notified about price alerts, purchases, and transactions'
                }
              </p>
            </div>
          </div>
          {isSubscribed ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleUnsubscribe}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disable'}
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enable'}
            </Button>
          )}
        </div>

        {/* Notification Categories */}
        {isSubscribed && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Notification Types</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <Label htmlFor="price-alerts" className="font-medium cursor-pointer">
                      Price Alerts
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      When crypto hits your target price
                    </p>
                  </div>
                </div>
                <Switch
                  id="price-alerts"
                  checked={preferences.priceAlerts}
                  onCheckedChange={(checked) => updatePreferences({ priceAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  <div>
                    <Label htmlFor="recurring" className="font-medium cursor-pointer">
                      Recurring Purchases
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      When auto-buy executes
                    </p>
                  </div>
                </div>
                <Switch
                  id="recurring"
                  checked={preferences.recurringPurchases}
                  onCheckedChange={(checked) => updatePreferences({ recurringPurchases: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  <div>
                    <Label htmlFor="transactions" className="font-medium cursor-pointer">
                      Transaction Updates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Send, receive, and swap confirmations
                    </p>
                  </div>
                </div>
                <Switch
                  id="transactions"
                  checked={preferences.transactionUpdates}
                  onCheckedChange={(checked) => updatePreferences({ transactionUpdates: checked })}
                />
              </div>
            </div>

            {/* Test Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={handleTestNotification}
            >
              <Bell className="h-4 w-4" />
              Send Test Notification
            </Button>
          </div>
        )}

        {/* Permission Denied Warning */}
        {permission === 'denied' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Permission Blocked</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Notification permission was denied. To enable, click the lock icon in your browser's address bar and allow notifications for this site.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
