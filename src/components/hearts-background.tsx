import Image from "next/image";
import { cn } from "@/lib/utils";

type HeartVariant = "hearts" | "glassheart";

type HeartConfig = {
  id: string;
  variant: HeartVariant;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width: number;
  height: number;
  rotation: number;
  animation: "slow" | "medium" | "fast";
  opacity: number;
  hideOnMobile?: boolean;
};

const HEARTS: HeartConfig[] = [
  {
    id: "left-top-hearts",
    variant: "hearts",
    top: "10%",
    left: "5%",
    width: 180,
    height: 180,
    rotation: -15,
    animation: "slow",
    opacity: 0.25,
    hideOnMobile: false,
  },
  {
    id: "right-top-glass",
    variant: "glassheart",
    top: "5%",
    right: "8%",
    width: 220,
    height: 220,
    rotation: 18,
    animation: "medium",
    opacity: 0.22,
    hideOnMobile: true,
  },
  {
    id: "center-left-glass",
    variant: "glassheart",
    top: "40%",
    left: "2%",
    width: 200,
    height: 200,
    rotation: -8,
    animation: "slow",
    opacity: 0.2,
    hideOnMobile: true,
  },
  {
    id: "center-right-hearts",
    variant: "hearts",
    top: "45%",
    right: "4%",
    width: 190,
    height: 190,
    rotation: 10,
    animation: "fast",
    opacity: 0.18,
    hideOnMobile: false,
  },
  {
    id: "bottom-left-hearts",
    variant: "hearts",
    bottom: "4%",
    left: "10%",
    width: 200,
    height: 200,
    rotation: 12,
    animation: "medium",
    opacity: 0.2,
    hideOnMobile: false,
  },
  {
    id: "bottom-right-glass",
    variant: "glassheart",
    bottom: "6%",
    right: "12%",
    width: 240,
    height: 240,
    rotation: -20,
    animation: "slow",
    opacity: 0.24,
    hideOnMobile: true,
  },
  {
    id: "top-center-small",
    variant: "hearts",
    top: "14%",
    left: "50%",
    width: 120,
    height: 120,
    rotation: 8,
    animation: "medium",
    opacity: 0.2,
    hideOnMobile: false,
  },
  {
    id: "mid-left-small",
    variant: "glassheart",
    top: "55%",
    left: "18%",
    width: 130,
    height: 130,
    rotation: -12,
    animation: "fast",
    opacity: 0.18,
    hideOnMobile: true,
  },
  {
    id: "mid-right-small",
    variant: "hearts",
    top: "58%",
    right: "16%",
    width: 130,
    height: 130,
    rotation: 14,
    animation: "slow",
    opacity: 0.19,
    hideOnMobile: true,
  },
  {
    id: "bottom-center-small",
    variant: "glassheart",
    bottom: "10%",
    left: "50%",
    width: 140,
    height: 140,
    rotation: -6,
    animation: "medium",
    opacity: 0.2,
    hideOnMobile: false,
  },
];

const getSrc = (variant: HeartVariant) => {
  switch (variant) {
    case "glassheart":
      return "/background/glassheart.png";
    case "hearts":
    default:
      return "/background/hearts.png";
  }
};

export function HeartsBackground() {
  return (
    <div className="heart-layer" aria-hidden="true">
      {HEARTS.map((heart) => {
        const positionStyle: React.CSSProperties = {
          top: heart.top,
          left: heart.left,
          right: heart.right,
          bottom: heart.bottom,
          width: heart.width,
          height: heart.height,
          transform: `rotate(${heart.rotation}deg)`,
          opacity: heart.opacity,
        };

        const animationClass =
          heart.animation === "fast"
            ? "heart--float-fast"
            : heart.animation === "medium"
              ? "heart--float-medium"
              : "heart--float-slow";

        const responsiveClass = heart.hideOnMobile ? "hidden sm:block" : "";

        return (
          <div
            key={heart.id}
            className={cn("heart", animationClass, responsiveClass)}
            style={positionStyle}
          >
            <Image
              src={getSrc(heart.variant)}
              alt=""
              fill
              sizes="(max-width: 768px) 40vw, 25vw"
              className="object-contain"
              priority={false}
            />
          </div>
        );
      })}
    </div>
  );
}

