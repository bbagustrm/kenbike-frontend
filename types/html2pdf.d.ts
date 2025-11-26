// types/html2pdf.d.ts
// Type declarations for html2pdf.js

declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: {
            type?: string;
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
            useCORS?: boolean;
            logging?: boolean;
        };
        jsPDF?: {
            unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'ex' | 'em' | 'pc';
            format?: string | number[];
            orientation?: 'portrait' | 'landscape';
            compress?: boolean;
        };
        pagebreak?: {
            mode?: string | string[];
            before?: string | string[];
            after?: string | string[];
            avoid?: string | string[];
        };
    }

    interface Html2Pdf {
        set(options: Html2PdfOptions): Html2Pdf;
        from(element: string | HTMLElement): Html2Pdf;
        save(): Promise<void>;
        output(type: string, options?: Record<string, unknown>): Promise<unknown>;
        toPdf(): Html2Pdf;
        get(key: string): Promise<unknown>;
    }

    function html2pdf(): Html2Pdf;

    namespace html2pdf {
        // Additional exports if needed
    }

    export = html2pdf;
}