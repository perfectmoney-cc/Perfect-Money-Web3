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

const termsOfService = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing and using PerfectMoney's platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use our services. These terms constitute a legally binding agreement between you and PerfectMoney."
  },
  {
    title: "2. Eligibility",
    content: "You must be at least 18 years old to use our services. By using the platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these terms. Users from restricted jurisdictions may be prohibited from accessing certain features."
  },
  {
    title: "3. Account Registration",
    content: "To access certain features, you must create an account by connecting a compatible Web3 wallet. You are responsible for maintaining the security of your wallet and private keys. We are not responsible for any losses resulting from unauthorized access to your wallet."
  },
  {
    title: "4. User Responsibilities",
    content: "You agree to use the platform in compliance with all applicable laws and regulations. You will not engage in fraudulent activities, money laundering, market manipulation, or any illegal conduct. You are responsible for all activities conducted through your account."
  },
  {
    title: "5. Platform Services",
    content: "PerfectMoney provides a decentralized payment platform facilitating token transfers, staking, marketplace access, and merchant services. We reserve the right to modify, suspend, or discontinue any service at any time without prior notice."
  },
  {
    title: "6. Token Transactions",
    content: "All token transactions are processed on the Binance Smart Chain and are irreversible once confirmed. You acknowledge that blockchain transactions cannot be reversed, and we are not responsible for transactions sent to incorrect addresses or losses due to user error."
  },
  {
    title: "7. Fees and Charges",
    content: "Certain platform features may be subject to transaction fees, service charges, or subscription costs. All fees will be clearly disclosed before you complete a transaction. Network gas fees are separate and determined by the blockchain network."
  },
  {
    title: "8. Staking and Rewards",
    content: "Staking rewards are subject to availability and may vary based on pool performance, network conditions, and platform policies. Rewards are not guaranteed and may change without notice. Staked tokens may be subject to lock-up periods."
  },
  {
    title: "9. Referral Program",
    content: "The referral program allows users to earn rewards by referring new users. Fraudulent referrals, self-referrals, or abuse of the program may result in forfeiture of rewards and account suspension. Referral terms may change at our discretion."
  },
  {
    title: "10. Merchant Services",
    content: "Merchants using our payment gateway must comply with applicable laws and regulations. We reserve the right to refuse service to any merchant engaged in illegal activities, prohibited industries, or fraudulent conduct. Merchant subscriptions are subject to separate terms."
  },
  {
    title: "11. Intellectual Property",
    content: "All content, trademarks, logos, and intellectual property on the platform are owned by PerfectMoney or licensed to us. You may not copy, reproduce, distribute, or create derivative works without our express written permission."
  },
  {
    title: "12. Prohibited Activities",
    content: "You may not use the platform for illegal activities, fraud, market manipulation, hacking, distributing malware, violating intellectual property rights, or circumventing security measures. Prohibited conduct may result in account termination and legal action."
  },
  {
    title: "13. Risk Disclosure",
    content: "Cryptocurrency investments carry significant risks including price volatility, loss of capital, regulatory changes, and technical vulnerabilities. You acknowledge these risks and agree that we are not responsible for any losses incurred from using our platform or holding PM tokens."
  },
  {
    title: "14. No Financial Advice",
    content: "Nothing on our platform constitutes financial, investment, legal, or tax advice. You should conduct your own research and consult with qualified professionals before making investment decisions. We do not recommend or endorse any investment strategies."
  },
  {
    title: "15. Privacy and Data Protection",
    content: "Our collection and use of personal information is governed by our Privacy Policy. By using the platform, you consent to our data practices as described in the Privacy Policy. We implement security measures to protect user data but cannot guarantee absolute security."
  },
  {
    title: "16. Third-Party Services",
    content: "Our platform integrates with third-party services including wallet providers, blockchain networks, and analytics tools. These services have their own terms and policies. We are not responsible for third-party service failures, security breaches, or policy violations."
  },
  {
    title: "17. Limitation of Liability",
    content: "To the maximum extent permitted by law, PerfectMoney shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the amount you paid to us in the 12 months preceding the claim."
  },
  {
    title: "18. Indemnification",
    content: "You agree to indemnify and hold harmless PerfectMoney, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of the platform or violation of these terms."
  },
  {
    title: "19. Dispute Resolution",
    content: "Any disputes arising from these terms or your use of the platform shall be resolved through binding arbitration in accordance with the rules of the applicable arbitration association. You waive your right to participate in class action lawsuits."
  },
  {
    title: "20. Governing Law",
    content: "These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which PerfectMoney is registered, without regard to conflict of law principles. Any legal actions must be brought in the courts of that jurisdiction."
  },
  {
    title: "21. Account Suspension and Termination",
    content: "We reserve the right to suspend or terminate your account at any time for violation of these terms, suspected fraudulent activity, legal requirements, or at our sole discretion. Upon termination, you may lose access to platform features and unredeemed rewards."
  },
  {
    title: "22. Force Majeure",
    content: "We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, riots, embargoes, acts of government, blockchain network failures, or other force majeure events."
  },
  {
    title: "23. Amendments to Terms",
    content: "We may modify these Terms of Service at any time by posting updated terms on our website. Material changes will be communicated via email or platform notification. Continued use of the platform after changes constitutes acceptance of the modified terms."
  },
  {
    title: "24. Severability",
    content: "If any provision of these terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable."
  },
  {
    title: "25. Entire Agreement",
    content: "These Terms of Service, together with our Privacy Policy and Cookie Policy, constitute the entire agreement between you and PerfectMoney regarding your use of the platform. These terms supersede all prior agreements, communications, and understandings."
  },
  {
    title: "26. KYC and AML Compliance",
    content: "We may require identity verification (Know Your Customer) for certain features or transactions. You agree to provide accurate information and documentation when requested. We comply with anti-money laundering (AML) regulations and may report suspicious activities to authorities."
  },
  {
    title: "27. Wallet Security",
    content: "You are solely responsible for securing your wallet, private keys, and seed phrases. We do not have access to your private keys and cannot recover lost or stolen funds. Never share your private keys or seed phrases with anyone, including platform support staff."
  },
  {
    title: "28. Smart Contract Risks",
    content: "Smart contracts carry inherent risks including bugs, vulnerabilities, and unexpected behavior. While we conduct security audits, we cannot guarantee that smart contracts are completely secure. You acknowledge these risks when interacting with smart contracts."
  },
  {
    title: "29. Tax Obligations",
    content: "You are responsible for determining and paying any taxes applicable to your transactions on the platform. We do not provide tax advice and recommend consulting with a qualified tax professional regarding your tax obligations."
  },
  {
    title: "30. Contact Information",
    content: "For questions about these Terms of Service, contact us at legal@perfectmoney.com. For technical support, use our contact form or email support@perfectmoney.com. We aim to respond to all inquiries within 48 hours during business days."
  }
];

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Terms of Service" 
        subtitle="Legal terms and conditions governing your use of PerfectMoney"
      />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 mb-8 bg-card/50 backdrop-blur-sm">
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Last Updated:</strong> January 2025
            </p>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") govern your access to and use of PerfectMoney's platform and 
              services. Please read these terms carefully before using our services. By accessing or using the 
              platform, you agree to be bound by these Terms and our Privacy Policy.
            </p>
          </Card>

          <Accordion type="single" collapsible className="space-y-4">
            {termsOfService.map((term, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-none">
                <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-primary/5 transition-colors">
                    <span className="text-left font-semibold">{term.title}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {term.content}
                    </p>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>

          <Card className="mt-8 p-8 bg-muted/30 border-muted">
            <h3 className="text-xl font-bold mb-4">Agreement</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By using PerfectMoney, you acknowledge that you have read, understood, and agree to be bound by 
              these Terms of Service. If you have any questions regarding these terms, please contact our legal 
              team at legal@perfectmoney.com before using the platform.
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;