"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
  showSpinner: false, // Disable the spinner
  trickleSpeed: 100, // Slightly faster trickle
  minimum: 0.3, // Start showing progress at 30%
});

export function PageTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done(); // Close any active progress bars when component mounts

    // Add CSS to head
    if (!document.getElementById("nprogress-styles")) {
      const style = document.createElement("style");
      style.id = "nprogress-styles";
      style.textContent = `
        /* Make clicks pass-through */
        #nprogress {
          pointer-events: none;
        }
        
        #nprogress .bar {
          background: hsl(var(--primary));
          position: fixed;
          z-index: 1031;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
        }
        
        /* Fancy blur effect */
        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary));
          opacity: 1.0;
          transform: rotate(3deg) translate(0px, -4px);
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      NProgress.done();
    };
  }, []);

  useEffect(() => {
    // Start the progress bar
    NProgress.start();

    // Set a small timeout to finish the progress bar - this creates
    // a more elegant transition effect
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300); // Adjust this timing if needed

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  return null;
}
