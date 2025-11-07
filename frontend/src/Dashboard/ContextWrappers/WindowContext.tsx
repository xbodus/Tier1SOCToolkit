import { createContext, useContext, useState } from "react";


export type WindowInstance = {
  id: string;
  app: string;
  minimize: boolean;
  zIndex: number;
  props?: any;
};

type WindowContextType = {
  windows: WindowInstance[];
  openWindow: (app: string, props?: any) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  bringToFront: (id: string) => void;
};

const WindowContext = createContext<WindowContextType | null>(null);

export function WindowProvider({ children }: { children: any }) {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [topZIndex, setTopZIndex] = useState<number>(1)

  const openWindow = (app: string, props?: any) => {
    // if window for this app already exists → bring to front and early return
    const existing = windows.find(w => w.app === app)
    if (existing) {
      if (existing.minimize) {
         minimizeWindow(existing.id)
      }
      return bringToFront(existing.id)
    }

    setWindows(wins => {
      // else create a new instance
      const id = crypto.randomUUID()

      const newWin: WindowInstance = {
        id,
        app,
        zIndex: 1,
        minimize: false,
        props
      }

      return [...wins, newWin]
    })
  };

  const closeWindow = (id: string) => setWindows(prev => prev.filter(w => w.id !== id));

  const minimizeWindow = (id: string) => {
    setWindows(windows =>
        windows.map(w => w.id === id ? {...w, minimize: !w.minimize} : w)
    )
    const existing = windows.find(w => w.id === id)
    if (existing) {
      return bringToFront(existing.id)
    }
  }

  const bringToFront = (id: string) => {
    setWindows(prev =>
      prev.map(win =>
        win.id === id ? { ...win, zIndex: topZIndex + 1 } : win
      )
    );
    setTopZIndex(prev => prev + 1);
  };

  return (
    <WindowContext.Provider value={{ windows, openWindow, closeWindow, minimizeWindow, bringToFront }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindowContext() {
  return useContext(WindowContext)!;
}