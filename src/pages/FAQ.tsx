import { Header } from "@/components/Header";
import { TradingViewTicker } from "@/components/TradingViewTicker";
import { HeroBanner } from "@/components/HeroBanner";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "What is Perfect Money Token?",
      answer: "Perfect Money (PM) is a decentralized payment platform built on Binance Smart Chain, offering fast, secure, and transparent transactions with low fees."
    },
    {
      question: "How do I buy PM tokens?",
      answer: "Connect your wallet, navigate to the Buy Token page, select your payment method, enter the amount, and confirm the transaction."
    },
    {
      question: "What wallets are supported?",
      answer: "We support MetaMask, Trust Wallet, WalletConnect, and Coinbase Wallet for BSC Mainnet and Testnet."
    },
    {
      question: "How does staking work?",
      answer: "Stake your PM tokens to earn rewards. Choose from flexible or locked staking options with different APY rates."
    },
    {
      question: "What are the transaction fees?",
      answer: "Transaction fees are minimal on BSC network, typically less than $0.50 per transaction."
    },
    {
      question: "Is my investment secure?",
      answer: "All transactions are secured by blockchain technology and smart contracts. We recommend using hardware wallets for maximum security."
    },
    {
      question: "How do I become a merchant?",
      answer: "Subscribe to one of our merchant packages in the Merchant Dashboard to start accepting PM token payments."
    },
    {
      question: "Can I refer friends?",
      answer: "Yes! Use the referral program to earn rewards when your friends join and trade on Perfect Money."
    }
  ];

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
              <p className="text-muted-foreground">Everything you need to know</p>
            </div>
          </div>

          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default FAQ;
