import { LucideProps } from "lucide-react";
import * as React from "react";

export const CustomMessagesIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ color = "currentColor", size = 24, strokeWidth = 2, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path
          d="M18.3327 5.20768V9.45766C18.3327 10.516 17.9827 11.4077 17.3577 12.0243C16.741 12.6493 15.8493 12.9993 14.791 12.9993V14.5077C14.791 15.0743 14.1577 15.416 13.691 15.0993L12.8827 14.566C12.9577 14.3077 12.991 14.0243 12.991 13.7243V10.3327C12.991 8.6327 11.8577 7.49935 10.1577 7.49935H4.49934C4.38268 7.49935 4.27435 7.5077 4.16602 7.51603V5.20768C4.16602 3.08268 5.58268 1.66602 7.70768 1.66602H14.791C16.916 1.66602 18.3327 3.08268 18.3327 5.20768Z"
          strokeMiterlimit="10"
        />
        <path
          d="M12.991 10.3334V13.725C12.991 14.025 12.9577 14.3083 12.8827 14.5667C12.5744 15.7917 11.5577 16.5583 10.1577 16.5583H7.89102L5.37435 18.2333C4.99935 18.4917 4.49934 18.2167 4.49934 17.7667V16.5583C3.64934 16.5583 2.94102 16.275 2.44935 15.7833C1.94935 15.2833 1.66602 14.575 1.66602 13.725V10.3334C1.66602 8.75002 2.64935 7.65835 4.16602 7.51668C4.27435 7.50835 4.38268 7.5 4.49934 7.5H10.1577C11.8577 7.5 12.991 8.63335 12.991 10.3334Z"
          strokeMiterlimit="10"
        />
      </svg>
    );
  },
);

CustomMessagesIcon.displayName = "CustomMessagesIcon";
