export default function Logo({ 
  variant = "img2", 
  className = "h-10 w-10" 
}: { 
  variant?: "img1" | "img2",
  className?: string 
}) {
  return (
    <img 
      src={`/${variant}.png`} 
      alt="InsightNest Logo" 
      className={`object-contain ${className}`}
    />
  );
}
