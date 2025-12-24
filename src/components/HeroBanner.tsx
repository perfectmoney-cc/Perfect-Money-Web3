interface HeroBannerProps {
  title: string;
  subtitle?: string;
}

export const HeroBanner = ({ title, subtitle }: HeroBannerProps) => {
  return (
    <div className="hidden md:block relative bg-gradient-to-r from-primary via-black to-primary py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-center text-white/80 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
