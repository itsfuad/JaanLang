declare const _variableSet: Set<string>;
declare let lines: string[];
declare let blockStart: boolean;
declare const keywordsControl: {
    jodi: boolean;
    nahole: boolean;
    "nahole jodi": boolean;
};
declare const keywordsLoop: {
    bar: boolean;
};
declare const keywords: {
    bar: boolean;
    jodi: boolean;
    nahole: boolean;
    "nahole jodi": boolean;
};
declare let indentationLevel: number;
declare function compile(code: string): string;
declare function isValidExpression(expression: string): false | string[];
declare function validateOperand(value: string, lineNumber: number): boolean;
declare function validateVariableName(variableName: string, lineNumber: number): void;
declare function isValidString(input: string): boolean;
declare function parseConditional(text: string, lineNumber: number): string;
declare function annotateErrorLine(lineNumber: number, message: string, position?: number): string;
declare function rangeLoopParser(text: string, lineNumber: number): string;
declare const code = "\nhi jaan\n    dhoro a holo \"hi\"\n    dhoro b holo 5\n    dhoro c holo 10\n\n    bolo b + c\n\n    jodi a b theke beshi na hoy tahole\n        bolo a\n\n\n    jodi a b theke kom hoy tahole\n        bolo b\n        bolo \"hi\"\n\n    10 bar\n        bolo \"Sorry jaan \" + $\n\nbye jaan\n";
