import { useState, useEffect } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    const addEventListeners = () => {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseenter', onMouseEnter);
      document.addEventListener('mouseleave', onMouseLeave);
      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mouseup', onMouseUp);
      addLinkHoverListeners();
    };

    const removeEventListeners = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      removeLinkHoverListeners();
    };

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseEnter = () => {
      setHidden(false);
    };

    const onMouseLeave = () => {
      setHidden(true);
    };

    const onMouseDown = () => {
      setClicked(true);
    };

    const onMouseUp = () => {
      setClicked(false);
    };

    const addLinkHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea').forEach(el => {
        el.addEventListener('mouseenter', onLinkMouseEnter);
        el.addEventListener('mouseleave', onLinkMouseLeave);
      });
    };

    const removeLinkHoverListeners = () => {
      document.querySelectorAll('a, button, [role="button"], input, select, textarea').forEach(el => {
        el.removeEventListener('mouseenter', onLinkMouseEnter);
        el.removeEventListener('mouseleave', onLinkMouseLeave);
      });
    };

    const onLinkMouseEnter = () => {
      setLinkHovered(true);
    };

    const onLinkMouseLeave = () => {
      setLinkHovered(false);
    };

    // Add event listeners on mount
    addEventListeners();

    // Add a mutation observer to detect DOM changes and update link listeners
    const observer = new MutationObserver(() => {
      removeLinkHoverListeners();
      addLinkHoverListeners();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up
    return () => {
      removeEventListeners();
      observer.disconnect();
    };
  }, []);

  // Don't render the custom cursor on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed left-0 top-0 z-[9999] transform ${hidden ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Outer cursor circle */}
      <div
        className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-300
          ${clicked ? 'scale-90' : linkHovered ? 'scale-150' : 'scale-100'}
          ${linkHovered ? 'bg-accent opacity-20' : 'border-2 border-highlight bg-transparent'}`}
        style={{
          width: linkHovered ? '32px' : '24px', 
          height: linkHovered ? '32px' : '24px',
        }}
      ></div>
      
      {/* Inner cursor dot */}
      <div 
        className={`absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 
          ${linkHovered ? 'scale-0' : 'scale-100'}
          bg-highlight`}
        style={{ 
          width: '4px', 
          height: '4px', 
        }}
      ></div>
    </div>
  );
}
