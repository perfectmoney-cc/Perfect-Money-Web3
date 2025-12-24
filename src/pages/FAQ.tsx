import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle, Coins, Wallet, Store, Shield, Zap, CreditCard, Users, Gift, Lock } from "lucide-react";

const FAQ = () => {
  const faqCategories = [
    {
      title: "General",
      icon: HelpCircle,
      faqs: [
        {
          question: "What is Perfect Money Token (PM)?",
          answer: "Perfect Money (PM) is a decentralized payment platform built on Binance Smart Chain (BSC). It offers fast, secure, and transparent transactions with minimal fees. PM token serves as the native currency for all platform transactions, staking rewards, and merchant payments."
        },
        {
          question: "What blockchain does Perfect Money use?",
          answer: "Perfect Money operates on the Binance Smart Chain (BSC) mainnet, chosen for its low transaction fees, fast confirmation times (typically 3-5 seconds), and robust security. This makes PM ideal for everyday payments and micro-transactions."
        },
        {
          question: "Is Perfect Money audited?",
          answer: "Yes, Perfect Money smart contracts have been reviewed for security. The platform undergoes regular security assessments to ensure the safety of user funds. You can view our security score and audit reports in the Token Security section of the dashboard."
        },
        {
          question: "What makes PM different from other payment tokens?",
          answer: "PM combines low fees, fast transactions, merchant tools, staking rewards, virtual cards, NFT marketplace, and a comprehensive referral system. Unlike simple payment tokens, PM provides a complete ecosystem for both consumers and merchants."
        },
        {
          question: "Where can I learn more about PM's roadmap?",
          answer: "Visit the Roadmap page on our website to see our development timeline, completed milestones, and upcoming features. We regularly update our roadmap based on community feedback and technological advancements."
        }
      ]
    },
    {
      title: "Buying & Trading",
      icon: Coins,
      faqs: [
        {
          question: "How do I buy PM tokens?",
          answer: "Connect your wallet (MetaMask, Trust Wallet, or WalletConnect compatible), navigate to the Buy Token page, select your payment method (BNB, USDT, USDC), enter the amount you wish to purchase, and confirm the transaction. Tokens are transferred directly to your wallet."
        },
        {
          question: "What is the current presale price?",
          answer: "The presale price varies by tier. Visit the Buy Token page to see the current price per PM token. Early buyers receive better rates. Presale purchases may have vesting schedules depending on the tier purchased."
        },
        {
          question: "Can I swap PM for other tokens?",
          answer: "Yes! Use the Swap feature in the dashboard to exchange PM tokens for BNB, USDT, USDC, or other supported tokens through PancakeSwap integration. Swaps are executed at real-time market rates with minimal slippage."
        },
        {
          question: "What are the trading fees?",
          answer: "Swap transactions include a small fee that varies based on liquidity pool conditions. The platform displays the estimated fees before you confirm any transaction. BSC network gas fees are typically less than $0.50."
        },
        {
          question: "Is there a minimum purchase amount?",
          answer: "The minimum purchase varies by payment method. Generally, you can buy as little as 100 PM tokens. The Buy Token page shows the current minimum for each payment option."
        }
      ]
    },
    {
      title: "Wallet & Security",
      icon: Wallet,
      faqs: [
        {
          question: "What wallets are supported?",
          answer: "We support MetaMask, Trust Wallet, WalletConnect, Rainbow Wallet, Coinbase Wallet, and other Web3-compatible wallets. Ensure your wallet is configured for BSC Mainnet (Chain ID: 56) before connecting."
        },
        {
          question: "How do I add PM token to my wallet?",
          answer: "Click 'Add to Wallet' on the dashboard or manually add the token using contract address: 0x181108f76d9910569203b5d59eb14Bc31961a989. Set decimals to 18 and symbol to PM."
        },
        {
          question: "Is my wallet secure when connected?",
          answer: "Yes. We never request your private keys or seed phrase. Wallet connections are read-only for balance display. All transactions require your explicit approval through your wallet's signature request."
        },
        {
          question: "Can I set up a PIN lock for extra security?",
          answer: "Yes! Enable PIN Lock in settings to add an extra security layer. This requires entering your PIN before accessing the dashboard or making transactions, even if your wallet is connected."
        },
        {
          question: "What should I do if I lose access to my wallet?",
          answer: "Your PM tokens are stored on the blockchain, not on our platform. Use your wallet's recovery phrase to restore access. We cannot recover lost wallets or reset passwords. Always keep your recovery phrase secure and offline."
        }
      ]
    },
    {
      title: "Staking & Vault",
      icon: Lock,
      faqs: [
        {
          question: "How does PM staking work?",
          answer: "Stake your PM tokens in the Vault to earn passive rewards. Choose from flexible staking (withdraw anytime) or locked staking (higher APY but tokens are locked for a set period). Rewards are distributed based on your stake amount and duration."
        },
        {
          question: "What are the staking APY rates?",
          answer: "APY rates vary by staking tier and lock duration. Flexible staking offers lower rates for liquidity, while 30-day, 90-day, and 365-day locks offer progressively higher returns. Check the Vault page for current rates."
        },
        {
          question: "How often are staking rewards distributed?",
          answer: "Rewards are calculated in real-time and can be claimed at any time. For locked staking, you can view accumulated rewards but cannot claim until the lock period ends. Auto-compound options are available for maximizing returns."
        },
        {
          question: "Can I withdraw my staked tokens early?",
          answer: "Flexible stakes can be withdrawn anytime. Locked stakes can be withdrawn early but may incur an early withdrawal penalty (typically 10-20% of rewards). The penalty decreases as you approach the unlock date."
        },
        {
          question: "What is the Vault referral bonus?",
          answer: "Earn additional rewards when users you refer stake in the Vault. Referral bonuses are paid as a percentage of your referrals' staking rewards, providing ongoing passive income."
        }
      ]
    },
    {
      title: "Merchant Services",
      icon: Store,
      faqs: [
        {
          question: "How do I become a merchant?",
          answer: "Navigate to the Merchant Dashboard and subscribe to either the Starter (10,000 PM/year) or Professional (25,000 PM/year) plan. After subscribing, you'll receive API keys and access to payment tools."
        },
        {
          question: "What's included in merchant plans?",
          answer: "Starter: 100 transactions/month, payment QR codes, basic analytics. Professional: Unlimited transactions, API access, custom payment links, webhook notifications, A/B testing, and priority support."
        },
        {
          question: "How do I create payment links?",
          answer: "In the Merchant Dashboard, click 'Create Link', enter the amount and description, set an expiry time, and generate. Share the link with customers via email, social media, or embed it on your website."
        },
        {
          question: "What is the POS Terminal feature?",
          answer: "The POS Terminal allows in-person payments. Display a QR code for the payment amount, and customers scan to pay instantly. Perfect for retail stores, restaurants, and service providers."
        },
        {
          question: "Can I accept multiple cryptocurrencies?",
          answer: "Yes! Professional merchants can accept PM, BNB, USDT, USDC, and PYUSD. Payments can be auto-converted to your preferred token or kept in the original currency."
        }
      ]
    },
    {
      title: "Virtual Card & NFTs",
      icon: CreditCard,
      faqs: [
        {
          question: "What is the PM Virtual Card?",
          answer: "The PM Virtual Card lets you spend your PM tokens at participating merchants. Create a card from your dashboard, load it with PM tokens, and enjoy cashback rewards on every purchase based on your tier level."
        },
        {
          question: "How do I get cashback on Virtual Card purchases?",
          answer: "Cashback rates are determined by your card tier (Standard to Diamond). Higher tiers unlock better cashback percentages. Cashback is automatically credited to your card balance after each eligible purchase."
        },
        {
          question: "Can I mint and sell NFTs on Perfect Money?",
          answer: "Yes! Use the Mint NFT feature to create NFTs with metadata stored on IPFS. List them on our marketplace with custom royalties. Buyers can purchase with PM tokens, and creators earn royalties on secondary sales."
        },
        {
          question: "What are the NFT marketplace fees?",
          answer: "The marketplace charges a small platform fee on sales. Creators can set royalty percentages (up to 10%) to earn from secondary sales. All fees are transparently displayed before listing or purchasing."
        },
        {
          question: "How do vouchers work?",
          answer: "Merchants can create digital vouchers as promotional tools. Customers redeem vouchers for discounts or free items. Vouchers can be single-use or multi-use, with customizable expiry dates and redemption limits."
        }
      ]
    }
  ];

  const totalFaqs = faqCategories.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20 lg:pb-0">
      <Header />
      <TradingViewTicker />
      <HeroBanner 
        title="Frequently Asked Questions" 
        subtitle="Find answers to common questions about Perfect Money"
      />
      
      <main className="container mx-auto px-4 pt-12 pb-12 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">FAQ</h1>
              <p className="text-muted-foreground">{totalFaqs} questions answered</p>
            </div>
          </div>

          <div className="space-y-6">
            {faqCategories.map((category, catIndex) => {
              const Icon = category.icon;
              return (
                <Card key={catIndex} className="p-6 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">{category.title}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`${catIndex}-${index}`}>
                        <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              );
            })}
          </div>

          {/* Contact Support Card */}
          <Card className="mt-8 p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default FAQ;