import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Monitor, Chrome, Apple, Download } from "lucide-react";
import { FaAndroid, FaApple, FaWindows, FaChrome } from "react-icons/fa";
import pmLogo from "@/assets/pm-app-logo.png";
const Downloads = () => {
  const handleDownload = (platform: string) => {
    // These would link to actual download URLs when apps are built and hosted
    const downloadLinks: Record<string, string> = {
      android: "/downloads/perfectmoney.apk",
      ios: "/downloads/perfectmoney.ipa",
      windows: "/downloads/PerfectMoney-Setup.exe",
      macos: "/downloads/PerfectMoney.dmg",
      chrome: "/chrome-extension/perfectmoney-extension.zip"
    };

    // For now, show instructions since actual builds require external tools
    window.open(`https://github.com/perfectmoney-cc/releases`, '_blank');
  };
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <img src={pmLogo} alt="Perfect Money" className="h-24 w-24 rounded-2xl shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold mb-4 md:text-3xl">
              Download <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Perfect Money</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              Access your decentralized wallet on any device. Available for mobile, desktop, and browser.
            </p>
          </div>

          {/* Mobile Apps */}
          <section className="mb-12">
            <h2 className="font-bold mb-6 flex items-center gap-2 text-xl">
              <Smartphone className="h-6 w-6 text-primary" />
              Mobile Apps
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Android */}
              <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <FaAndroid className="h-8 w-8 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Android</CardTitle>
                      <CardDescription>APK Download</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download the APK file directly and install on your Android device. Enable "Unknown Sources" in settings.
                  </p>
                  <Button className="w-full gap-2" variant="gradient" onClick={() => handleDownload('android')}>
                    <Download className="h-4 w-4" />
                    Download APK
                  </Button>
                </CardContent>
              </Card>

              {/* iOS */}
              <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gray-500/10">
                      <FaApple className="h-8 w-8 text-gray-300" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">iOS</CardTitle>
                      <CardDescription>IPA Download</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download the IPA file for iOS. Requires AltStore or similar tool for installation.
                  </p>
                  <Button className="w-full gap-2" variant="gradient" onClick={() => handleDownload('ios')}>
                    <Download className="h-4 w-4" />
                    Download IPA
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Desktop Apps */}
          <section className="mb-12">
            <h2 className="font-bold mb-6 flex items-center gap-2 text-xl">
              <Monitor className="h-6 w-6 text-primary" />
              Desktop Apps
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Windows */}
              <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <FaWindows className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Windows</CardTitle>
                      <CardDescription>Windows 10/11</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download the installer for Windows. Supports Windows 10 and Windows 11.
                  </p>
                  <Button className="w-full gap-2" variant="gradient" onClick={() => handleDownload('windows')}>
                    <Download className="h-4 w-4" />
                    Download for Windows
                  </Button>
                </CardContent>
              </Card>

              {/* macOS */}
              <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gray-500/10">
                      <FaApple className="h-8 w-8 text-gray-300" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">macOS</CardTitle>
                      <CardDescription>macOS 11+</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Download the DMG file for macOS. Supports macOS Big Sur and later.
                  </p>
                  <Button className="w-full gap-2" variant="gradient" onClick={() => handleDownload('macos')}>
                    <Download className="h-4 w-4" />
                    Download for macOS
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Browser Extension */}
          <section className="mb-12">
            <h2 className="font-bold mb-6 flex items-center gap-2 text-xl">
              <Chrome className="h-6 w-6 text-primary" />
              Browser Extension
            </h2>
            <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <FaChrome className="h-8 w-8 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Chrome Extension</CardTitle>
                    <CardDescription>Chrome, Brave, Edge</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Quick access to your Perfect Money wallet directly from your browser toolbar. 
                  Works with Chrome, Brave, Edge, and other Chromium-based browsers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 gap-2" variant="gradient" onClick={() => handleDownload('chrome')}>
                    <Download className="h-4 w-4" />
                    Download Extension
                  </Button>
                  <Button className="flex-1 gap-2" variant="outline" onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}>
                    <FaChrome className="h-4 w-4" />
                    Chrome Web Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* PWA Install */}
          <section>
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="p-4 rounded-2xl bg-background/50">
                    <Smartphone className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold mb-2 text-lg">Install from Browser</h3>
                    <p className="text-muted-foreground">
                      You can also install Perfect Money directly from your browser without downloading any files. 
                      Just visit our website and click "Add to Home Screen" or use the install prompt.
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Visit Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Developer Note */}
          <div className="mt-12 p-6 rounded-xl bg-muted/30 border border-border">
            <h3 className="font-semibold mb-2">For Developers</h3>
            <p className="text-sm text-muted-foreground">
              Native apps are built using Capacitor for mobile and Electron for desktop. 
              To build from source, clone our{" "}
              <a href="https://github.com/perfectmoney-cc" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                GitHub repository
              </a>{" "}
              and follow the build instructions in the README.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Downloads;