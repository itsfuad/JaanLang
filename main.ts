#!/usr/bin/env node

import { readFile, existsSync } from 'fs';

const _variableSet = new Set<string>();

function compile(code: string) {

    //remove starting and trailing spaces
    const lines = code.trim().split("\n");

    if (!lines[0].trim().startsWith("hi jaan")) {
        throw new Error("Missing Program entrypoint: hi jaan");
    }

    if (!lines[lines.length - 1].trim().startsWith("bye jaan")) {
        throw new Error("Missing Program exitpoint: bye jaan");
    }

    //remove first and last line
    lines.shift();
    lines.pop();

    let output = "";

    for (let i = 0; i < lines.length; i++) {

        //remove starting and trailing spaces
        lines[i] = lines[i].trim();

        //if comment then return
        if (lines[i][0] === "#") {
            continue;
        }

        //if line does not start with jodi then return
        if (lines[i].startsWith("nahole jodi")) {
            output = output + "} else " + parseConditional(lines[i].replace("nahole jodi", ""), i);
        } else if (lines[i].startsWith("jodi")) {
            output += parseConditional(lines[i], i);
        }
        else if (lines[i].startsWith("nahole")) {
            output += "} else {";
        } else if (lines[i].startsWith("kichu bolar nai")) {
            output += "}";
        } else if (lines[i].trim().startsWith("bolo")) {
            //use regex
            output += lines[i].replace(/(^\s)*bolo\s+(.*)$/gm, 'console.log($2);');
        } else if (lines[i].trim().startsWith("dhoro")) {
            //use regex
            //validate variable name
            //A variable name must start with a letter, underscore or dollar sign. Subsequent characters can also be digits (0-9).
            //check if variable is already declared
            //output += lines[i].replace(/(^\s)*dhoro\s+(.*)$/gm, 'let $2;');
            //variable can be be only declared, or declared and assigned a value. Capture variable name and value like (dhoro) (variableName) ((holo) (value)?)
            const regex = /dhoro\s+([a-zA-Z_$0-9]*)\s*(?:holo\s+(['"]?[a-zA-Z0-9]+['"]?)?)?/;

            const matches = lines[i].match(regex);
            if (matches) {
                const variableName = matches[1];
                //console.log(variableName);
                const value = matches[2];
                //console.log(value);
                //check if value is not a number
                if (value && !/^[0-9]+$/.test(value)) {
                    //console.log(`Value: ${value} is not a number.`);
                    //check if value is a string
                    validateOperand(value, i);
                }else if(!value){
                    //console.log(`Value: ${value} is undefined.`);
                    throw new Error(`Line ${i}: Invalid syntax '${lines[i]}'`);
                }

                validateVariableName(variableName, i);

                if (_variableSet.has(variableName)) {
                    throw new Error(`Uff!! ${variableName} bolso to ekbar.`);
                }
                output += `let ${variableName};`;
                _variableSet.add(variableName);
            }

        } else if (/(.*) bar\s*(.*)/.test(lines[i])) {
            output += rangeLoopParser(lines[i], i);
        }
        else {
            output += lines[i];
        }
    }

    
    return output;
}

function validateOperand(value: string, lineNumber: number) {
    if (/^["']/.test(value)) {
        //console.log(`Value: ${value} is a string.`);
        //check if value is a string with proper quotes pair
        if (/^["'].*["']$/.test(value) === false) {
            //console.log(`Line ${lineNumber}: ${value} is a string with proper quotes pair.`);
            throw new Error(`Line ${lineNumber}: Strings must be enclosed with ' or " '${value}'`);
        }
    } else if (/^[0-9]+$/.test(value) === false) {
        //console.log(`Value: ${value} is a variable.`);
        validateVariableName(value, lineNumber);
        if (!_variableSet.has(value)) {
            throw new Error(`Line ${lineNumber}: ${value} is not declared.`);
        }
    }
}

function validateVariableName(variableName: string, lineNumber: number) {
    //A variable name must start with a letter, underscore or dollar sign. Subsequent characters can also be digits (0-9).
    if (!/^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(variableName)) {
        throw new Error(`Line - ${lineNumber}: Invalid variable name: ${variableName}. Variable name must start with a letter, underscore or dollar sign. Subsequent characters can also be digits (0-9).`);
    }
}

function parseConditional(text: string, lineNumber: number){

    //extract 2 parts of the conditional, first remove the jodi keyword.
    text = text.replace("jodi", "");
    //regex to extract the pattern1: (variable) (condition) (value) or pattern2: (variable) (value) [(hoy) tahole|(na hoy) tahole|(theke beshi) (hoy) tahole|(theke kom) (hoy) tahole|(theke beshi ba soman) (hoy) tahole|(theke kom ba soman) (hoy) tahole]
    const regex = /([a-zA-Z0-9]+) ([<>=!]+) ([a-zA-z0-9]+)/; //pattern1
    // if (variable) (value) hoy tahole -> if variable == value
    // if (variable) (value) na hoy tahole -> if variable != value
    // if (variable) (value) theke beshi hoy tahole -> if variable > value
    // if (variable) (value) theke kom hoy tahole -> if variable < value
    // if (variable) (value) theke beshi ba soman hoy tahole -> if variable >= value
    // if (variable) (value) theke kom ba soman hoy tahole -> if variable <= value
    // if (variable) (value) theke beshi na hoy tahole -> if variable > value === false
    // if (variable) (value) theke kom na hoy tahole -> if variable < value === false
    // if (variable) (value) theke beshi ba soman na hoy tahole -> if variable >= value === false
    // if (variable) (value) theke kom ba soman na hoy tahole -> if variable <= value === false

    const regex2 = /([a-zA-Z0-9]+) ([a-zA-Z0-9]+) (hoy|na hoy|theke beshi|theke kom|theke beshi ba soman|theke kom ba soman) ((hoy|na hoy)?)/; //pattern2

    const matches = text.match(regex);
    const matches2 = text.match(regex2);

    let variable1 = "";
    let variable2 = "";
    let operator = "";
    let extraCondition = "";

    //console.log(text);

    if (matches) {
        //if jodi hoy tahole
        variable1 = matches[1];
        variable2 = matches[3];

        validateOperand(variable1, lineNumber);
        validateOperand(variable2, lineNumber);

        operator = matches[2];

        //console.log(variable1, operator, variable2);
        
    } else if (matches2) {
        //console.log(text);
        //if hoy tahole
        variable1 = matches2[1];
        variable2 = matches2[2];

        validateOperand(variable1, lineNumber);
        validateOperand(variable2, lineNumber);

        operator = matches2[3];
        extraCondition = matches2[4];

        if (operator === "theke beshi") {
            operator = ">";
        } else if (operator === "theke kom") {
            operator = "<";
        } else if (operator === "hoy") {
            operator = "===";
        } else if (operator === "na hoy") {
            operator = "!==";
        }

        if (extraCondition === "na hoy") {
            extraCondition = "=== false";
        } else if (extraCondition === "hoy") {
            extraCondition = "=== true";
        }

        //console.log(variable1, operator, variable2, extraCondition);
    }

    return `if (${variable1} ${operator} ${variable2} ${extraCondition}) {`;
}

function rangeLoopParser(text: string, lineNumber: number) {
    
    //syntax: (number) bar
    //User can use $ to access the current value of the loop
    //user can write like: 10 bar ewrwejwnel 
    //any text after 'bar' will be considered as syntax error
    //check if any text after bar
    const regex = /(.*) bar\s*(.*)/;
    const matches = text.match(regex);
    if (matches) {
        const number = matches[1];

        //if number is number both positive and negative and float
        if (/^-?\d*(\.\d+)?$/.test(number) === false) {
            throw new Error(`Line: ${lineNumber}: Invalid value '${number}'`);
        } else if (Number(number) < 0){
            throw new Error(`Line: ${lineNumber}: Invalid value '${number}'. Range loop must be positive.`);
        }

        //console.log(text, number, matches[2]);

        if (matches[2].trim() !== "") {
            throw new Error(`Line: ${lineNumber}: Invalid token '${matches[2]}'`);
        }

        return `for (let $ = 1; $ <= ${matches[1]}; $++) {`;
    }

    return text;
}


//console.log(parseConditional("jodi kichuEkta 3 hoy tahole"));
//console.log(parseConditional("jodi kichuEkta 3 na hoy tahole"));
//console.log(parseConditional("jodi kichuEkta 3 theke beshi hoy tahole"));
//console.log(parseConditional("jodi kichuEkta 3 theke kom hoy tahole"));
//console.log(parseConditional("jodi kichuEkta 3 theke beshi na hoy tahole"));
//console.log(parseConditional("jodi kichuEkta 3 theke kom na hoy tahole"));
//console.log(parseConditional("jodi kichuEkta 3 theke kom ba soman hoy tahole"));
//console.log(parseConditional("jodi kichuEkta 3 theke kom ba soman na hoy tahole"));

const MEANING_MAP = {
    'hi jaan': 'Start of the program',
    'bye jaan': 'End of the program',
    'dhoro': 'Declare a variable: let <variableName>',
    'holo': 'Assign a value to a variable: <variableName> = <value>',
    'jodi': 'If statement: if <variableName> <operator> <value>',
    'tahole': 'Start of the if block: {',
    'kichu bolar nai': 'End of any block: }',
    'bar': 'Range loop: for (let $ = 1; $ <= <value>; $++) {',
    'bolo': 'Print statement: console.log(<value>)',
    'hoy': 'Equal to: ===',
    'na hoy': 'Not equal to: !==',
    'theke beshi': 'Greater than: >',
    'theke kom': 'Less than: <',
    'theke beshi ba soman': 'Greater than or equal to: >=',
    'theke kom ba soman': 'Less than or equal to: <=',
};

const COMMENT = '#';
const VARIABLE = '([a-zA-Z0-9]+)';
const OPERATORS = ['<', '>', '==', '!=', '<=', '>=', '===', '!==', 'na hoy', 'hoy', 'holo', 'theke beshi', 'theke kom', 'theke beshi ba soman', 'theke kom ba soman'];

const srcCode = `
hi jaan
# This is a comment
dhoro id holo 6
dhoro kichuEkta holo id
dhoro amrNaam holo "Rakib"
dhoro nasa holo 9
dhoro ass holo 'abb'

jodi kichuEkta <= 0 na hoy tahole
    bolo "0 theke kom"
nahole jodi kichuEkta > 78 hoy tahole
    bolo "0 theke beshi"
nahole
    bolo "huh?"
kichu bolar nai

jodi kichuEkta 0 hoy tahole
    bolo "0 hoyeche"
kichu bolar nai

jodi kichuEkta 0 na hoy tahole
    bolo "0 hoy nai"
kichu bolar nai

jodi kichuEkta 15 theke beshi hoy tahole
    bolo "0 theke beshi hoyeche"
kichu bolar nai

jodi kichuEkta 5 theke kom na hoy tahole
    bolo "0 theke kom hoyeche"
kichu bolar nai

jodi kichuEkta 9 hoy tahole
    bolo "9 hoyeche"
kichu bolar nai


10 bar
    bolo "Sorry Jaan " + $
kichu bolar nai

-2 bar
    bolo "Kire"
kichu bolar nai

bye jaan
`;


function runCode(code: string) {
    const parsedCode = compile(code);
    try {
        eval(parsedCode);
    } catch (e) {
        console.log(`Ki korso eita?? ${e}`);
    }
}


let filename = process.argv[2];

if (!filename) {
    console.error('Error: No files specified');
    process.exit(1);
}

// filetype: source.jaan or jaan
// if no filetype then assume it is jaan
// if filetype is not jaan then throw error

if (existsSync(filename) === false) {
    console.error(`Error: File ${filename} not found`);
    process.exit(1);
}

if (!filename.endsWith('.jaan')) {
    const endsWith = filename.split('.').pop();
    if (endsWith === ""){
        filename = filename + ".jaan";
    } else {
        console.error(`Error: Invalid file type: ${filename}`);
        process.exit(1);
    }
}

//read file
readFile(filename, 'utf8', (err, data) => {
    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    } else {
        runCode(data);
    }
});