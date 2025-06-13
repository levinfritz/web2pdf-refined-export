// Typen für Seitenumbrüche
export interface PageBreak {
  id: string;
  selector: string;
  type: 'add' | 'prevent';
  position?: 'before' | 'after';
}

export interface PageBreakRule {
  id: string;
  selector: string;
  condition: string;
  action: 'add' | 'prevent';
}

// Hilfsfunktionen für Seitenumbrüche
export const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
};

// Funktion zum Hinzufügen eines Seitenumbruchs
export const addPageBreak = (
  breaks: PageBreak[],
  selector: string,
  position: 'before' | 'after' = 'after'
): PageBreak[] => {
  const newBreak: PageBreak = {
    id: generateUniqueId(),
    selector,
    type: 'add',
    position,
  };
  return [...breaks, newBreak];
};

// Funktion zum Verhindern eines Seitenumbruchs
export const preventPageBreak = (
  breaks: PageBreak[],
  selector: string
): PageBreak[] => {
  const newBreak: PageBreak = {
    id: generateUniqueId(),
    selector,
    type: 'prevent',
  };
  return [...breaks, newBreak];
};

// Funktion zum Entfernen eines Seitenumbruchs
export const removePageBreak = (
  breaks: PageBreak[],
  id: string
): PageBreak[] => {
  return breaks.filter((breakItem) => breakItem.id !== id);
};

// Funktion zum Hinzufügen einer Seitenumbruch-Regel
export const addPageBreakRule = (
  rules: PageBreakRule[],
  selector: string,
  condition: string,
  action: 'add' | 'prevent'
): PageBreakRule[] => {
  const newRule: PageBreakRule = {
    id: generateUniqueId(),
    selector,
    condition,
    action,
  };
  return [...rules, newRule];
};

// Funktion zum Entfernen einer Seitenumbruch-Regel
export const removePageBreakRule = (
  rules: PageBreakRule[],
  id: string
): PageBreakRule[] => {
  return rules.filter((rule) => rule.id !== id);
};

// Funktion zum Generieren von CSS für Seitenumbrüche
export const generatePageBreakCSS = (breaks: PageBreak[]): string => {
  return breaks
    .map((breakItem) => {
      if (breakItem.type === 'add') {
        return `${breakItem.selector} { page-break-${breakItem.position}: always; }`;
      } else {
        return `${breakItem.selector} { page-break-inside: avoid; }`;
      }
    })
    .join('\n');
};
