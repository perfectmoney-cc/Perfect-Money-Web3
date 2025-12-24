import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const cookiePolicies = [
  {
    title: "1. What Are Cookies",
    content: "Cookies are small text files that are placed on your computer or mobile device when you visit our website. They are widely used to make websites work more efficiently and provide information to the owners of the site. Cookies help us understand how you use our website and improve your experience."
  },
  {
    title: "2. Types of Cookies We Use",
    content: "We use both session cookies (which expire when you close your browser) and persistent cookies (which stay on your device for a set period). These include strictly necessary cookies, performance cookies, functionality cookies, and targeting cookies."
  },
  {
    title: "3. Strictly Necessary Cookies",
    content: "These cookies are essential for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies as they are required for the website to operate."
  },
  {
    title: "4. Performance Cookies",
    content: "These cookies collect information about how visitors use our website, such as which pages are visited most often and if error messages are received. This data helps us improve how our website works and optimize user experience."
  },
  {
    title: "5. Functionality Cookies",
    content: "These cookies allow our website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features. They may also be used to provide services you have requested."
  },
  {
    title: "6. Targeting/Advertising Cookies",
    content: "These cookies are used to deliver advertisements relevant to you and your interests. They also limit the number of times you see an advertisement and help measure the effectiveness of advertising campaigns."
  },
  {
    title: "7. Third-Party Cookies",
    content: "Some cookies are placed by third-party services that appear on our pages. We use services from partners such as analytics providers, advertising networks, and social media platforms. These third parties may use cookies to collect information about your online activities."
  },
  {
    title: "8. Wallet Connection Cookies",
    content: "When you connect your Web3 wallet (such as MetaMask or WalletConnect) to our platform, we store cookies to maintain your session and remember your wallet preferences. This ensures a seamless experience across visits."
  },
  {
    title: "9. Analytics and Statistics",
    content: "We use cookies to collect anonymous statistics about website usage. This includes tracking page views, user journeys, bounce rates, and conversion metrics. This data helps us understand user behavior and improve our services."
  },
  {
    title: "10. How to Control Cookies",
    content: "Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. However, disabling cookies may affect the functionality of our website and limit your ability to use certain features."
  },
  {
    title: "11. Cookie Duration",
    content: "Session cookies are temporary and are deleted when you close your browser. Persistent cookies remain on your device for a specified period or until you delete them. The duration varies depending on the cookie type and purpose."
  },
  {
    title: "12. Updates to Cookie Policy",
    content: "We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business operations. We will notify users of any material changes by posting the updated policy on our website with a new effective date."
  },
  {
    title: "13. Your Consent",
    content: "By continuing to use our website, you consent to our use of cookies as described in this policy. If you do not agree with our use of cookies, you should adjust your browser settings or discontinue use of the website."
  },
  {
    title: "14. Cookie Data Security",
    content: "We implement appropriate security measures to protect cookie data from unauthorized access, alteration, or destruction. Cookie information is encrypted where necessary and stored securely in compliance with data protection regulations."
  },
  {
    title: "15. Contact Information",
    content: "If you have any questions about our use of cookies or this Cookie Policy, please contact us at privacy@perfectmoney.com. We are committed to addressing your concerns and ensuring transparency in our data practices."
  }
];

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Cookie Policy" 
        subtitle="Understanding how we use cookies to enhance your experience"
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8 bg-card/50 backdrop-blur-sm">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Cookie Policy explains how PerfectMoney ("we", "us", or "our") uses cookies and similar 
              technologies when you visit our website. This policy should be read together with our Privacy 
              Policy and Terms of Service.
            </p>
          </Card>

          <Accordion type="single" collapsible className="space-y-4">
            {cookiePolicies.map((policy, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-none">
                <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-primary/5 transition-colors">
                    <span className="text-left font-semibold">{policy.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {policy.content}
                    </p>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="mt-8 p-8 bg-muted/30 border-muted">
            <h3 className="text-xl font-bold mb-4">Cookie Management</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can manage your cookie preferences through your browser settings. Most browsers allow you to 
              refuse cookies or delete them. Please note that disabling cookies may impact the functionality of 
              our website and your user experience. For more information about managing cookies, visit your 
              browser's help documentation.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;