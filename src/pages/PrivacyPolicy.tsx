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

const privacyPolicies = [
  {
    title: "1. Information We Collect",
    content: "We collect various types of information to provide and improve our services. This includes personal information such as name, email address, wallet addresses, transaction history, and device information. We also collect usage data, cookies, and analytics information to understand how users interact with our platform."
  },
  {
    title: "2. How We Use Your Information",
    content: "Your information is used to operate and maintain our platform, process transactions, provide customer support, send service updates, improve our services, comply with legal obligations, and detect and prevent fraud. We use analytics to understand user behavior and optimize the platform experience."
  },
  {
    title: "3. Wallet and Blockchain Data",
    content: "When you connect your Web3 wallet, we access your public wallet address and transaction history. Blockchain transactions are public and permanent. We do not have access to your private keys or seed phrases. You maintain full control and custody of your digital assets at all times."
  },
  {
    title: "4. Information Sharing and Disclosure",
    content: "We do not sell your personal information to third parties. We may share information with service providers who assist in platform operations, legal authorities when required by law, business partners with your consent, and in connection with business transfers or mergers."
  },
  {
    title: "5. Data Security",
    content: "We implement industry-standard security measures to protect your information, including encryption, secure servers, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure. We encourage users to use strong passwords and enable two-factor authentication."
  },
  {
    title: "6. Data Retention",
    content: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce agreements. Transaction records on the blockchain are permanent and cannot be deleted."
  },
  {
    title: "7. Your Privacy Rights",
    content: "Depending on your location, you may have rights to access, correct, delete, or export your personal data. You can request restrictions on processing, object to certain uses, and withdraw consent. To exercise these rights, contact us at privacy@perfectmoney.com."
  },
  {
    title: "8. Cookies and Tracking Technologies",
    content: "We use cookies, web beacons, and similar technologies to enhance user experience, analyze usage patterns, and deliver personalized content. You can control cookies through your browser settings. For detailed information, please refer to our Cookie Policy."
  },
  {
    title: "9. Third-Party Services",
    content: "Our platform integrates with third-party services such as wallet providers (MetaMask, WalletConnect), blockchain networks (Binance Smart Chain), analytics tools, and payment processors. These services have their own privacy policies, and we encourage you to review them."
  },
  {
    title: "10. International Data Transfers",
    content: "Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy."
  },
  {
    title: "11. Children's Privacy",
    content: "Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information promptly."
  },
  {
    title: "12. Marketing Communications",
    content: "With your consent, we may send you promotional emails, newsletters, and updates about our services. You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or updating your notification preferences in your account settings."
  },
  {
    title: "13. Account Information",
    content: "You are responsible for maintaining the confidentiality of your account credentials. Notify us immediately if you suspect unauthorized access to your account. We are not liable for losses resulting from unauthorized use of your account due to your failure to maintain security."
  },
  {
    title: "14. Data Breach Notification",
    content: "In the event of a data breach that affects your personal information, we will notify you and relevant authorities as required by applicable law. We will provide information about the breach and steps we are taking to address it."
  },
  {
    title: "15. Analytics and Performance Monitoring",
    content: "We use analytics tools to monitor platform performance, user engagement, and service improvements. This includes tracking page views, feature usage, error rates, and load times. Analytics data is aggregated and anonymized where possible."
  },
  {
    title: "16. Legal Basis for Processing",
    content: "We process your personal information based on various legal grounds including your consent, performance of a contract, compliance with legal obligations, protection of vital interests, and our legitimate business interests in providing and improving our services."
  },
  {
    title: "17. KYC and Compliance",
    content: "For certain features or regulatory compliance, we may require identity verification (KYC). This may include collecting government-issued IDs, proof of address, and facial verification. KYC data is processed securely and in accordance with applicable regulations."
  },
  {
    title: "18. Transaction Monitoring",
    content: "We monitor transactions for suspicious activity, fraud prevention, and compliance with anti-money laundering (AML) regulations. Unusual patterns may trigger additional verification requirements or account restrictions to protect users and comply with legal obligations."
  },
  {
    title: "19. Affiliate and Referral Programs",
    content: "If you participate in our referral or affiliate programs, we collect information about referrals, commissions earned, and payout details. This information is used to manage the program and process rewards."
  },
  {
    title: "20. Smart Contract Interactions",
    content: "When you interact with smart contracts on our platform, transaction details are recorded on the blockchain. This data is public and permanent. We log contract interactions for support and analytics purposes."
  },
  {
    title: "21. Customer Support",
    content: "When you contact customer support, we collect communication records, support tickets, and related information. This helps us resolve issues, improve service quality, and maintain support history."
  },
  {
    title: "22. Updates to Privacy Policy",
    content: "We may update this Privacy Policy periodically to reflect changes in our practices, technology, legal requirements, or business operations. Material changes will be communicated via email or prominent notice on our website."
  },
  {
    title: "23. Automated Decision Making",
    content: "We may use automated systems for fraud detection, risk assessment, and service personalization. You have the right to request human review of automated decisions that significantly affect you."
  },
  {
    title: "24. Data Protection Officer",
    content: "For privacy-related inquiries or to exercise your rights, contact our Data Protection Officer at dpo@perfectmoney.com. We will respond to requests within the timeframes required by applicable data protection laws."
  },
  {
    title: "25. Contact Information",
    content: "For questions, concerns, or requests regarding this Privacy Policy or our data practices, contact us at: privacy@perfectmoney.com. You can also reach us via our contact form on the website or by mail at our registered business address."
  }
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Privacy Policy" 
        subtitle="Your privacy and data protection are our top priorities"
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8 bg-card/50 backdrop-blur-sm">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy describes how PerfectMoney ("we", "us", or "our") collects, uses, shares, 
              and protects your personal information. By using our platform, you consent to the data practices 
              described in this policy. Please read this policy carefully to understand our practices regarding 
              your data.
            </p>
          </Card>

          <Accordion type="single" collapsible className="space-y-4">
            {privacyPolicies.map((policy, index) => (
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
            <h3 className="text-xl font-bold mb-4">Your Data Rights</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the right to access, correct, delete, or export your personal data. To exercise these 
              rights or if you have questions about our privacy practices, please contact our Data Protection 
              Officer at dpo@perfectmoney.com. We are committed to protecting your privacy and complying with 
              applicable data protection laws.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;