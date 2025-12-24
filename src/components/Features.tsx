import { Wallet, ArrowLeftRight, PiggyBank, Store, Users, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Wallet,
    title: "Token Wallet",
    description: "Securely store and manage your PM tokens with Web3 wallet integration."
  },
  {
    icon: ArrowLeftRight,
    title: "Instant Transfers",
    description: "Send and receive PM tokens instantly with minimal transaction fees."
  },
  {
    icon: PiggyBank,
    title: "Staking Rewards",
    description: "Earn passive income by staking your PM tokens with competitive APY."
  },
  {
    icon: Store,
    title: "Merchant Gateway",
    description: "Accept PM token payments with our seamless merchant integration."
  },
  {
    icon: Users,
    title: "Referral Program",
    description: "Earn rewards by referring new users to the PerfectMoney platform."
  },
  {
    icon: ShieldCheck,
    title: "Security First",
    description: "Audited smart contracts and optional KYC for enhanced security."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
            Everything You Need
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A complete decentralized payment ecosystem built on Binance Smart Chain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="mb-4 inline-block p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
