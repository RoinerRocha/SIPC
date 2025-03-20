import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Definir los valores posibles del tamaño de la fuente
type FontSizeType = "small" | "medium" | "large";

// Definir la forma del contexto
interface FontSizeContextType {
    fontSize: FontSizeType;
    setFontSize: (size: FontSizeType) => void;
}

// Crear el contexto con valores por defecto
const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

// Hook para usar el contexto
export const useFontSize = () => {
    const context = useContext(FontSizeContext);
    if (!context) {
        throw new Error("useFontSize debe usarse dentro de un FontSizeProvider");
    }
    return context;
};

// Proveedor del contexto
export const FontSizeProvider = ({ children }: { children: ReactNode }) => {
    const [fontSize, setFontSize] = useState<FontSizeType>(() => {
        return (localStorage.getItem("globalFontSize") as FontSizeType) || "medium";
    });

    useEffect(() => {
        localStorage.setItem("globalFontSize", fontSize);
        window.dispatchEvent(new Event("storage")); // Notificar cambio a otras pestañas
    }, [fontSize]);

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
            {children}
        </FontSizeContext.Provider>
    );
};
