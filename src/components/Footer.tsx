import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import pmLogo from "@/assets/pm-logo-new.png";
import usdtLogo from "@/assets/usdt-logo.png";
import usdcLogo from "@/assets/usdc-logo.png";
import bnbLogo from "@/assets/bnb-logo.png";
import solLogo from "@/assets/sol-logo.png";
import trxLogo from "@/assets/trx-logo.png";
import bscLogo from "@/assets/bsc-logo.png";
import maticLogo from "@/assets/matic-logo.png";
import metamaskLogo from "@/assets/metamask-logo.svg";
import trustWalletLogo from "@/assets/trust-wallet-logo.svg";
import phantomLogo from "@/assets/phantom-logo.svg";
import tronlinkLogo from "@/assets/tronlink-logo.png";
import { Facebook, Youtube, Github } from "lucide-react";
export const Footer = () => {
  const isMobile = useIsMobile();

  // Hide footer on mobile
  if (isMobile) {
    return null;
  }
  return <footer className="border-t border-border bg-[#0a0e1a] mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* Top Section */}
        <div className="grid grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img alt="Perfect Money" src="/lovable-uploads/1f18ea95-c5fa-4f4f-89ce-8586de189248.png" className="h-10 w-10" />
              <span className="text-white font-mono text-lg">Perfect Money™</span>
            </div>
            <p className="text-gray-400 text-sm font-mono leading-relaxed">
              Experience Perfect Money reimagined – a decentralized payment system powered by USDT, USDC, and the native PM token for fast, secure, borderless transactions.
            </p>
          </div>

          {/* Web3 Ecosystem */}
          <div className="space-y-4">
            <h4 className="text-white font-mono text-sm font-semibold">Web3 Ecosystem</h4>
            <div className="flex gap-3">
              <img src={bscLogo} alt="BNB Chain" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" />
              <img src={maticLogo} alt="Polygon" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" />
              <img alt="Solana" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/834863f4-b3bb-4ab0-a588-a310ff679a61.png" />
              <img alt="Tron" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/67e5b9df-f02c-4357-b617-2d006356db35.png" />
            </div>
          </div>

          {/* Social Icons */}
          <div className="space-y-4">
            <h4 className="text-white font-mono text-sm font-semibold">Social Icons</h4>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/perfectmoney.cc" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 hover:scale-125 transition-all duration-300 ease-in-out">
                <Facebook className="w-[28px] h-[28px]" />
              </a>
              <a href="https://x.com/perfectmoney_cc" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 hover:scale-125 transition-all duration-300 ease-in-out">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://www.youtube.com/@perfectmoney_cc" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 hover:scale-125 transition-all duration-300 ease-in-out">
                <Youtube className="w-[28px] h-[28px]" />
              </a>
              <a href="https://t.me/perfectmoney_cc" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 hover:scale-125 transition-all duration-300 ease-in-out">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a href="https://github.com/perfectmoney-cc" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-500 hover:scale-125 transition-all duration-300 ease-in-out">
                <Github className="w-[28px] h-[28px]" />
              </a>
            </div>
          </div>

          {/* Supported Wallets */}
          <div className="space-y-4">
            <h4 className="text-white font-mono text-sm font-semibold">Supported Wallets</h4>
            <div className="flex gap-3">
              <img alt="MetaMask" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/76fd18e4-ce0b-4404-a21e-5acda3bfa9d1.png" />
              <img alt="Trust Wallet" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/20a0111c-bd40-4a84-9423-162db909428e.png" />
              <img alt="Phantom" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/4e7a69c7-7f69-41dc-bf08-36f191d9d3d3.webp" />
              <img alt="TronLink" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/38248811-9e71-464c-abbe-8eb3c37fa049.png" />
            </div>
          </div>

          {/* Accepted Payments */}
          <div className="space-y-4">
            <h4 className="text-white font-mono text-sm font-semibold">Accepted Payments</h4>
            <div className="grid grid-cols-3 gap-2">
              <img src={usdtLogo} alt="USDT" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" />
              <img src={usdcLogo} alt="USDC" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" />
              <img src={pmLogo} alt="PM" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" />
              <img src={bnbLogo} alt="BNB" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" />
              <img alt="SOL" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/cf98e305-dcf8-4399-b94b-276114c91207.png" />
              <img alt="TRX" className="h-8 w-8 hover:scale-125 transition-all duration-300 ease-in-out cursor-pointer" src="/lovable-uploads/fdd44038-5849-4da2-90f4-7ac7dfffb862.png" />
            </div>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-4 gap-8 py-8 border-t border-border/30">
          {/* Main */}
          <div className="space-y-3">
            <h4 className="text-white font-mono text-sm font-semibold border-l-2 border-red-500 pl-3">Main</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-white hover:text-red-500 text-sm font-mono transition-colors">About Us</Link></li>
              <li><Link to="/dashboard" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Ecosystem</Link></li>
              <li><Link to="/tokenomics" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Tokenomics</Link></li>
              <li><Link to="/roadmap" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Roadmap</Link></li>
              <li><Link to="/dashboard" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Dapps</Link></li>
              <li><Link to="/dashboard/buy" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Presale</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="space-y-3">
            <h4 className="text-white font-mono text-sm font-semibold border-l-2 border-red-500 pl-3">Useful Links</h4>
            <ul className="space-y-2">
              <li><Link to="/terms-of-service" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy-policy" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Cookie Policy</Link></li>
              <li><Link to="/legal-compliance" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Legal Compliance</Link></li>
              <li><Link to="/faq" className="text-white hover:text-red-500 text-sm font-mono transition-colors">F.A.Q</Link></li>
              <li><Link to="/brand-assets" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Brand Assets</Link></li>
            </ul>
          </div>

          {/* Helpdesk */}
          <div className="space-y-3">
            <h4 className="text-white font-mono text-sm font-semibold border-l-2 border-red-500 pl-3">Helpdesk</h4>
            <ul className="space-y-2">
              <li><Link to="/whitepaper" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Documentations</Link></li>
              <li><Link to="/whitepaper" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Whitepaper</Link></li>
              <li><Link to="/presale-terms" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Presale Terms</Link></li>
              <li><Link to="/dashboard/token-sender" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Token Sender</Link></li>
              <li><Link to="/dashboard/token-locker" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Token Locker</Link></li>
              <li><Link to="/dashboard/token-security" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Security Audit</Link></li>
            </ul>
          </div>

          {/* Advertise With Us */}
          <div className="space-y-3">
            <h4 className="text-white font-mono text-sm font-semibold border-l-2 border-red-500 pl-3">Advertise With Us</h4>
            <ul className="space-y-2">
              <li><Link to="/dashboard/partners/apply" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Become a Partners</Link></li>
              <li><Link to="/dashboard/partners" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Local Exchangers</Link></li>
              <li><Link to="/dashboard/referral" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Affiliate Program</Link></li>
              <li><Link to="/dashboard/community" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Community Managers</Link></li>
              <li><Link to="/contact" className="text-white hover:text-red-500 text-sm font-mono transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-border/30 text-center">
          <p className="text-sm font-mono text-secondary">
            Copyright © 2025. Perfect Money | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>;
};