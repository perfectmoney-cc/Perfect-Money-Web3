import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PinLockProvider } from "@/components/PinLockProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { config } from './config/web3';
import '@rainbow-me/rainbowkit/styles.css';
import Index from "./pages/Index";
import MobileLanding from "./pages/MobileLanding";
import Dashboard from "./pages/Dashboard";
import SendPage from "./pages/dashboard/Send";
import ReceivePage from "./pages/dashboard/Receive";
import BuyTokenPage from "./pages/dashboard/BuyToken";
import StakePage from "./pages/dashboard/Stake";
import MarketplacePage from "./pages/dashboard/Marketplace";
import MerchantPage from "./pages/dashboard/Merchant";
import ReferralPage from "./pages/dashboard/Referral";
import PartnersPage from "./pages/dashboard/Partners";
import ApplyPartnership from "./pages/dashboard/ApplyPartnership";
import GeneratePaymentQR from "./pages/dashboard/GeneratePaymentQR";
import CreatePaymentLink from "./pages/dashboard/CreatePaymentLink";
import ShareLinkDetails from "./pages/dashboard/ShareLinkDetails";
import MerchantTransactions from "./pages/dashboard/MerchantTransactions";
import MerchantLinks from "./pages/dashboard/MerchantLinks";
import PaymentDetails from "./pages/dashboard/PaymentDetails";
import Roadmap from "./pages/Roadmap";
import Tokenomics from "./pages/Tokenomics";
import Whitepaper from "./pages/Whitepaper";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import ContactUs from "./pages/ContactUs";
import CookiePolicy from "./pages/CookiePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import APIIntegration from "./pages/APIIntegration";
import AirdropPage from "./pages/dashboard/Airdrop";
import AirdropAdminPage from "./pages/dashboard/AirdropAdmin";
import SwapPage from "./pages/dashboard/Swap";
import TokenSecurityPage from "./pages/dashboard/TokenSecurity";
import CommunityPage from "./pages/dashboard/Community";
import TokenSenderPage from "./pages/dashboard/TokenSender";
import TokenLockerPage from "./pages/dashboard/TokenLocker";
import PresaleAdminPage from "./pages/dashboard/PresaleAdmin";
import TokenClaimPage from "./pages/dashboard/TokenClaim";
import MintNFTPage from "./pages/dashboard/MintNFT";
import MarketplaceMinters from "./pages/dashboard/MarketplaceMinters";
import MarketplaceStats from "./pages/dashboard/MarketplaceStats";
import NFTAdmin from "./pages/dashboard/NFTAdmin";
import VoucherPage from "./pages/dashboard/Voucher";
import VoucherAdminPage from "./pages/dashboard/VoucherAdmin";
import VaultPage from "./pages/dashboard/Vault";
import VaultAdminPage from "./pages/dashboard/VaultAdmin";
import VirtualCardPage from "./pages/dashboard/VirtualCard";
import VirtualCardAdmin from "./pages/dashboard/VirtualCardAdmin";
import PartnersAdmin from "./pages/dashboard/PartnersAdmin";
import MerchantMultiCurrency from "./pages/dashboard/MerchantMultiCurrency";
import MerchantLoyalty from "./pages/dashboard/MerchantLoyalty";
import MerchantPOS from "./pages/dashboard/MerchantPOS";
import MerchantRegister from "./pages/dashboard/MerchantRegister";
import POSTerminal from "./pages/dashboard/POSTerminal";
import Trade from "./pages/dashboard/Trade";
import MerchantRecurring from "./pages/dashboard/MerchantRecurring";
import MerchantAnalytics from "./pages/dashboard/MerchantAnalytics";
import MerchantPromotion from "./pages/dashboard/MerchantPromotion";
import PresaleTerms from "./pages/PresaleTerms";
import LegalCompliance from "./pages/LegalCompliance";
import BrandAssets from "./pages/BrandAssets";
import Downloads from "./pages/Downloads";
import StorePage from "./pages/dashboard/Store";
import OrderHistoryPage from "./pages/dashboard/OrderHistory";
import StoreAdminPage from "./pages/dashboard/StoreAdmin";
import MerchantAPIPage from "./pages/dashboard/MerchantAPI";
import MerchantAdminPage from "./pages/dashboard/MerchantAdmin";
import WebhookLogsPage from "./pages/dashboard/WebhookLogs";
import WebhookAnalyticsPage from "./pages/dashboard/WebhookAnalytics";
import PaymentCheckout from "./pages/PaymentCheckout";
import MerchantAPIDocs from "./pages/dashboard/MerchantAPIDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#dc2626',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
          <PinLockProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/" element={
                window.innerWidth < 768 ? <MobileLanding /> : <Index />
              } />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/send" element={<SendPage />} />
              <Route path="/dashboard/receive" element={<ReceivePage />} />
              <Route path="/dashboard/buy" element={<BuyTokenPage />} />
              <Route path="/dashboard/stake" element={<StakePage />} />
              <Route path="/dashboard/marketplace" element={<MarketplacePage />} />
              <Route path="/dashboard/merchant" element={<MerchantPage />} />
              <Route path="/dashboard/referral" element={<ReferralPage />} />
              <Route path="/dashboard/partners" element={<PartnersPage />} />
              <Route path="/dashboard/partners/apply" element={<ApplyPartnership />} />
              <Route path="/dashboard/partners/admin" element={<PartnersAdmin />} />
              <Route path="/dashboard/merchant/generate-qr" element={<GeneratePaymentQR />} />
              <Route path="/dashboard/merchant/create-link" element={<CreatePaymentLink />} />
              <Route path="/dashboard/merchant/share-link" element={<ShareLinkDetails />} />
              <Route path="/dashboard/merchant/transactions" element={<MerchantTransactions />} />
              <Route path="/dashboard/merchant/links" element={<MerchantLinks />} />
              <Route path="/dashboard/payment" element={<PaymentDetails />} />
              <Route path="/dashboard/airdrop" element={<AirdropPage />} />
              <Route path="/dashboard/airdrop/admin" element={<AirdropAdminPage />} />
              <Route path="/dashboard/swap" element={<SwapPage />} />
              <Route path="/dashboard/trade" element={<Trade />} />
              <Route path="/dashboard/token-security" element={<TokenSecurityPage />} />
              <Route path="/dashboard/community" element={<CommunityPage />} />
              <Route path="/dashboard/token-sender" element={<TokenSenderPage />} />
              <Route path="/dashboard/token-locker" element={<TokenLockerPage />} />
              <Route path="/dashboard/presale-admin" element={<PresaleAdminPage />} />
              <Route path="/dashboard/token-claim" element={<TokenClaimPage />} />
              <Route path="/dashboard/mint-nft" element={<MintNFTPage />} />
              <Route path="/dashboard/marketplace/minters" element={<MarketplaceMinters />} />
              <Route path="/dashboard/marketplace/stats" element={<MarketplaceStats />} />
              <Route path="/dashboard/marketplace/admin" element={<NFTAdmin />} />
              <Route path="/dashboard/voucher" element={<VoucherPage />} />
              <Route path="/dashboard/voucher/admin" element={<VoucherAdminPage />} />
              <Route path="/dashboard/vault" element={<VaultPage />} />
              <Route path="/dashboard/vault/admin" element={<VaultAdminPage />} />
              <Route path="/dashboard/virtual-card" element={<VirtualCardPage />} />
              <Route path="/dashboard/virtual-card/admin" element={<VirtualCardAdmin />} />
              <Route path="/dashboard/merchant/multi-currency" element={<MerchantMultiCurrency />} />
              <Route path="/dashboard/merchant/loyalty" element={<MerchantLoyalty />} />
              <Route path="/dashboard/merchant/pos" element={<MerchantPOS />} />
              <Route path="/dashboard/merchant/register" element={<MerchantRegister />} />
              <Route path="/dashboard/pos" element={<POSTerminal />} />
              <Route path="/dashboard/merchant/recurring" element={<MerchantRecurring />} />
              <Route path="/dashboard/merchant/analytics" element={<MerchantAnalytics />} />
              <Route path="/dashboard/merchant/promotions" element={<MerchantPromotion />} />
              <Route path="/dashboard/store" element={<StorePage />} />
              <Route path="/dashboard/store/orders" element={<OrderHistoryPage />} />
              <Route path="/dashboard/store/admin" element={<StoreAdminPage />} />
              <Route path="/dashboard/merchant/api" element={<MerchantAPIPage />} />
              <Route path="/dashboard/merchant/admin" element={<MerchantAdminPage />} />
              <Route path="/dashboard/merchant/webhook-logs" element={<WebhookLogsPage />} />
              <Route path="/dashboard/merchant/webhook-analytics" element={<WebhookAnalyticsPage />} />
              <Route path="/dashboard/merchant/api-docs" element={<MerchantAPIDocs />} />
              <Route path="/pay/:id" element={<PaymentCheckout />} />
              <Route path="/roadmap" element={<Roadmap />} />
              <Route path="/tokenomics" element={<Tokenomics />} />
              <Route path="/whitepaper" element={<Whitepaper />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/api-integration" element={<APIIntegration />} />
              <Route path="/presale-terms" element={<PresaleTerms />} />
              <Route path="/legal-compliance" element={<LegalCompliance />} />
              <Route path="/brand-assets" element={<BrandAssets />} />
              <Route path="/downloads" element={<Downloads />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </PinLockProvider>
        </RainbowKitProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
