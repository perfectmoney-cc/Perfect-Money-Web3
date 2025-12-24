import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { WalletCard } from "@/components/WalletCard";
import { ArrowLeft, Users, MessageCircle, Send, Calendar, Trophy, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { FaTwitter, FaTelegram, FaDiscord, FaFacebook, FaYoutube } from "react-icons/fa";
const CommunityPage = () => {
  const communityLinks = [{
    name: "Twitter X",
    icon: FaTwitter,
    members: "52.3K",
    link: "https://twitter.com/perfectmoney",
    color: "bg-sky-500/10 text-sky-500 border-sky-500/20"
  }, {
    name: "Facebook",
    icon: FaFacebook,
    members: "48.7K",
    link: "https://facebook.com/perfectmoney",
    color: "bg-blue-600/10 text-blue-600 border-blue-600/20"
  }, {
    name: "Youtube",
    icon: FaYoutube,
    members: "38.4K",
    link: "https://youtube.com/@perfectmoney",
    color: "bg-red-600/10 text-red-600 border-red-600/20"
  }, {
    name: "Telegram",
    icon: FaTelegram,
    members: "42.1K",
    link: "https://t.me/perfectmoney",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20"
  }, {
    name: "Discord",
    icon: FaDiscord,
    members: "35.8K",
    link: "https://discord.gg/perfectmoney",
    color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
  }];
  const upcomingEvents = [{
    title: "AMA Session with Team",
    date: "Feb 15, 2025",
    time: "3:00 PM UTC",
    platform: "Telegram"
  }, {
    title: "Trading Competition",
    date: "Feb 20, 2025",
    time: "All Day",
    platform: "Website"
  }, {
    title: "Community Meetup",
    date: "Mar 1, 2025",
    time: "2:00 PM UTC",
    platform: "Discord"
  }];
  const topContributors = [{
    rank: 1,
    name: "CryptoWhale",
    contributions: 145,
    avatar: "🐋"
  }, {
    rank: 2,
    name: "PMMaximalist",
    contributions: 132,
    avatar: "💎"
  }, {
    rank: 3,
    name: "TokenHodler",
    contributions: 98,
    avatar: "🚀"
  }, {
    rank: 4,
    name: "DeFiEnthusiast",
    contributions: 87,
    avatar: "⚡"
  }, {
    rank: 5,
    name: "BlockchainPro",
    contributions: 76,
    avatar: "🔥"
  }];
  return <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner title="Perfect Money Community" subtitle="Join our global community and stay connected" />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        {/* Mobile Wallet Card */}
        <div className="md:hidden mt-5 mb-6">
          <WalletCard showQuickFunctionsToggle={false} compact={true} />
        </div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-1">217.3K</h3>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-1">2.4K</h3>
              <p className="text-sm text-muted-foreground">Daily Active</p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <Send className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-1">15.2K</h3>
              <p className="text-sm text-muted-foreground">Messages/Day</p>
            </Card>
            <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-1">98%</h3>
              <p className="text-sm text-muted-foreground">Engagement</p>
            </Card>
          </div>

          {/* Social Channels */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Join Our Community</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {communityLinks.map(channel => {
              const Icon = channel.icon;
              return <Card key={channel.name} className={`p-6 backdrop-blur-sm border ${channel.color}`}>
                    <div className="text-center">
                      <div className="inline-flex p-4 rounded-full bg-background/50 mb-4">
                        <Icon className="h-8 w-8" />
                      </div>
                      <h3 className="font-bold text-lg mb-1">{channel.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{channel.members} Members</p>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to={channel.link}>Join Now</Link>
                      </Button>
                    </div>
                  </Card>;
            })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Events */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Upcoming Events</h2>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event, idx) => <div key={idx} className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <h3 className="font-bold mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {event.date}
                      </span>
                      <span>• {event.time}</span>
                      <span className="text-primary">📍 {event.platform}</span>
                    </div>
                  </div>)}
              </div>
            </Card>

            {/* Top Contributors */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Top Contributors</h2>
              </div>
              <div className="space-y-3">
                {topContributors.map(contributor => <div key={contributor.rank} className={`flex items-center justify-between p-4 border rounded-lg ${contributor.rank === 1 ? 'border-yellow-500/50 bg-yellow-500/5' : contributor.rank === 2 ? 'border-gray-400/50 bg-gray-400/5' : contributor.rank === 3 ? 'border-orange-500/50 bg-orange-500/5' : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{contributor.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">#{contributor.rank}</span>
                          <span className="font-medium">{contributor.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contributor.contributions} contributions
                        </p>
                      </div>
                    </div>
                    {contributor.rank <= 3 && <Trophy className={`h-5 w-5 ${contributor.rank === 1 ? 'text-yellow-500' : contributor.rank === 2 ? 'text-gray-400' : 'text-orange-500'}`} />}
                  </div>)}
              </div>
            </Card>
          </div>

          {/* Community Guidelines */}
          <Card className="p-8 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-6">Community Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3 text-green-500">✓ Do's</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Be respectful and courteous to all members</li>
                  <li>• Share helpful information and insights</li>
                  <li>• Ask questions and engage in discussions</li>
                  <li>• Report spam and inappropriate content</li>
                  <li>• Support and help new community members</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold mb-3 text-red-500">✗ Don'ts</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Share price predictions or financial advice</li>
                  <li>• Spam, shill, or advertise other projects</li>
                  <li>• Share personal information or private keys</li>
                  <li>• Engage in harassment or hate speech</li>
                  <li>• Spread FUD or unverified information</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>;
};
export default CommunityPage;