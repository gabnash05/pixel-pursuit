// contexts/ScanContext.tsx
import React, { createContext, useState, useContext } from 'react';

interface ScanContextType {
    scanTrigger: number;
    triggerScan: () => void;
}

const ScanContext = createContext<ScanContextType>({
    scanTrigger: 0,
    triggerScan: () => {},
});

export const ScanProvider = ({ children }: { children: React.ReactNode }) => {
    const [scanTrigger, setScanTrigger] = useState(0);

    const triggerScan = () => {
        setScanTrigger(prev => prev + 1);
    };

    return (
        <ScanContext.Provider value={{ scanTrigger, triggerScan }}>
            {children}
        </ScanContext.Provider>
    );
};

export const useScan = () => useContext(ScanContext);