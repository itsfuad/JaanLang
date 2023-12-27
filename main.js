#!/usr/bin/env node
import { readFile, existsSync } from 'fs';
import chalk from 'chalk';
import { config } from 'dotenv';
config();
const log = console.log;
//get version from package.json
const version = process.env.npm_package_version || 'Development';
const _variableSet = new Set();
_variableSet.add("$");
let lines = [];
let blockStart = false;
const keywordsControl = {
    "jodi": true,
    "nahole": true,
    "nahole jodi": true,
};
const keywordsLoop = {
    "bar": true
};
const keywords = Object.assign(Object.assign({}, keywordsControl), keywordsLoop);
function compile(code) {
    //remove starting and trailing spaces
    lines = code.trim().split("\n");
    if (lines[0].trim() !== "hi jaan") {
        throw new Error("😑: Missing Program entrypoint: hi jaan");
    }
    if (lines[lines.length - 1].trim() !== "bye jaan") {
        throw new Error("😑: Missing Program exitpoint: bye jaan");
    }
    //remove first and last line
    lines.shift();
    lines.pop();
    let output = "";
    for (let i = 0; i < lines.length; i++) {
        try {
            //check indentation level
            //validate indentation level
            //if indentation level is not valid then throw error
            //remove starting and trailing spaces
            //lines[i] = lines[i].trim();
            //if comment then return
            if (lines[i][0] === "#") {
                continue;
            }
            //if block is not closed and line is empty then throw error
            if (blockStart === true && i === lines.length - 1) {
                throw new Error(`😑: This block is not closed.`);
            }
            //if line does not start with jodi then return
            if (lines[i].trim().startsWith("nahole jodi")) {
                if (!blockStart) {
                    throw new Error(`😑: Conditional statement er block start hoy 'jodi' statement diye.`);
                }
                output = output + "} else " + parseConditional(lines[i].replace("nahole jodi", ""), i);
            }
            else if (lines[i].trim().startsWith("jodi")) {
                blockStart = true;
                output += parseConditional(lines[i], i);
                if (!lines[i].endsWith("tahole")) {
                    throw new Error(`😑: Conditional statement er block start korte sesh e 'tahole' likha lage pagol.`);
                }
            }
            else if (lines[i].trim().startsWith("nahole")) {
                if (!blockStart) {
                    throw new Error(`😑: Conditional statement er block start hoy 'jodi' statement diye.`);
                }
                output += "} else {";
            }
            else if (lines[i].trim().startsWith("kichu bolar nai")) {
                //end of block
                output += "}";
                blockStart = false;
            }
            else if (lines[i].trim().startsWith("bolo")) {
                //find parameter of bolo
                const expression = lines[i].replace("bolo", "").trim();
                //extract all parameters by searching for variables and strings
                const regex = /(["'](.*)["'])|([a-zA-Z0-9]+)/g;
                const matches = expression.match(regex);
                if (!matches) {
                    const garbage = expression.replace(/["'].*["']/g, "").replace(/[a-zA-Z0-9]+/g, "").trim();
                    if (garbage) {
                        throw new Error(`😑: Invalid token \`${garbage}\``);
                    }
                    throw new Error(`😑: Bolo ki? kichu to bolo.`);
                }
                //validate expression
                //expression can be a string or a variable or a combination of both
                if (!isValidExpression(expression)) {
                    throw new Error(`😑: Invalid expression '${expression}'`);
                }
                //validate each parameter
                for (const match of matches) {
                    validateOperand(match);
                }
                //use regex
                output += lines[i].replace(/(^\s)*bolo\s+(.*)$/gm, 'console.log($2);');
            }
            else if (lines[i].trim().startsWith("dhoro")) {
                //implement code
                //remove dhoro and split by "holo"
                const variableDeclaration = lines[i].replace("dhoro", "");
                //if variableDeclaration contains holo then split by holo
                const variableDeclarationParts = variableDeclaration.split("holo").map((part) => part.trim());
                if (variableDeclarationParts.length > 1) {
                    if (!variableDeclarationParts[1]) {
                        throw new Error(`😑: Expected value after 'holo'. Missing value of '${variableDeclarationParts[0]}'`);
                    }
                    else {
                        //check if it is a variable or value
                        validateOperand(variableDeclarationParts[1]);
                    }
                }
                if (variableDeclarationParts.length > 2) {
                    throw new Error(`😑: Unexpected token '${variableDeclarationParts[2]}'`);
                }
                validateVariableName(variableDeclarationParts[0]);
                output += `let ${variableDeclarationParts[0]} = ${variableDeclarationParts[1] || 0};`;
                _variableSet.add(variableDeclarationParts[0]);
            }
            else if (/(.*) bar\s*(.*)/.test(lines[i])) {
                output += rangeLoopParser(lines[i]);
                blockStart = true;
            }
            else {
                output += lines[i];
            }
        }
        catch (e) {
            //console.log(`Line ${i + 2}: ${e.message}`);
            throw new Error(`Compilation failed\nLine ${i + 2}: ${e.message}`);
        }
    }
    return output;
}
/*
function isValidExpression(expression: string) {
    console.log(expression);
    const ValidExpression = /^(\$|[a-zA-Z0-9]+|[a-zA-Z0-9]+\+[a-zA-Z0-9]+)$/;
    console.log(`[${expression}] = ${ValidExpression.test(expression)}`);
    return ValidExpression.test(expression);
}
*/
function isValidExpression(expression) {
    //split all tokens by operators and keep the operators in the array
    const tokens = expression.split(/([+\-*/]+)/).filter((token) => token !== undefined && token !== "" && token !== " ").map((token) => token.trim());
    const operators = [];
    //validate each token
    for (const token of tokens) {
        //an operator can only be in the middle of 2 operands or minus sign can be before an operand but multiple minus sign cannot be before an operand. two minus sign can be before operand like a - -b. means a  - (-b) = a + b
        if (/[+\-*/]+/.test(token)) {
            operators.push(token);
        }
        else {
            validateOperand(token);
        }
    }
    if (tokens[tokens.length - 1].match(/[+\-*/]+/)) {
        return false;
    }
    //same operator cannot be positioned next to each other like a + + b is invalid, a + - b is valid, a - - b is valid, a - + b is valid
    for (let i = 0; i < operators.length; i++) {
        if (operators[i].length > 1) {
            for (let j = 0; j < operators[i].length; j++) {
                if (operators[i][j] === operators[i][j + 1]) {
                    //console.log("Same operator cannot be positioned next to each other: " + expression);
                    return false;
                }
            }
        }
    }
    //eval(`2 + 4 * == 5`); //Unexpected token '=='
    //eval(`2 + 4 * = 5`); //Unexpected token '='
    //eval(`2 + 4 = 5`); //Invalid left-hand side in assignment
    //eval(`2 + 4 == 5`); //true
    //eval(`2 + 4 5`); //Unexpected number
    //eval(`2 + 4 * 5 ==`); //Unexpected end of input
    //Also need to implement this type of validation
    return tokens;
}
/*
_variableSet.add("$");
_variableSet.add("a");
_variableSet.add("b");
_variableSet.add("c");
_variableSet.add("d");
_variableSet.add("q");
_variableSet.add("sd");

console.log(isValidExpression("a")); //true
console.log(isValidExpression("$")); //true reserved variable
console.log(isValidExpression("a + b")); //true
console.log(isValidExpression("a + b + c")); //true
console.log(isValidExpression("a + b + 10 - d")); //true
console.log(isValidExpression("a + b + 10 - -d + 5")); //true 10 - (-d) + 5
console.log(isValidExpression("a + b +")); //false expression cannot end with operator
console.log(isValidExpression("a + b + 10 -")); //false expression cannot end with operator
console.log(isValidExpression("-a")); //true -a is a valid expression
console.log(isValidExpression("+a")); //true
console.log(isValidExpression("a +- b")); //true a + (-b)
console.log(isValidExpression("a + +b")); //true
console.log(isValidExpression("a + +")); //false expression cannot end with operator
console.log(isValidExpression("a -")); //false expression cannot end with operator
console.log(isValidExpression(`"Hello"`)); //true
console.log(isValidExpression(`'Hello'`)); //true
//console.log(isValidExpression(`"Hello`)); //false Unmatched quotes
//console.log(isValidExpression(`'Hello`)); //false Unmatched quotes
//console.log(isValidExpression(`Hello"`)); //false Unmatched quotes
//console.log(isValidExpression(`Hello'`)); //false  Unmatched quotes
console.log(isValidExpression(`"Hello" + "World"`)); //true
//console.log(isValidExpression(`"Hello" + "World`)); //false Unmatched quotes
//console.log(isValidExpression(`"Hello" + "`)); //false
console.log(isValidExpression(`"Hello" + q`)); //true
console.log(isValidExpression(`"Hello" + q + "World  " +`)); //false expression cannot end with operator
console.log(isValidExpression(`2 + 4 * sd`)); //false Unexpected token '='
//eval(`2 + 4 * == 5`); //Unexpected token '=='
//eval(`2 + 4 * = 5`); //Unexpected token '='
//eval(`2 + 4 = 5`); //Invalid left-hand side in assignment
//eval(`2 + 4 == 5`); //true
//eval(`2 + 4 5`); //Unexpected number
//eval(`2 + 4 * 5 ==`); //Unexpected end of input
*/
function validateOperand(value) {
    if (/["']/.test(value)) {
        //check if value is a string with proper quotes pair
        if (isValidString(value) === false) {
            //value = value.replace(/^["']/, "").replace(/["']$/, "");
            throw new Error(`😑: Dhur jaan! Strings similar quotation e rakha lage jano na?. "${value}" or '${value}' eivabe.`);
        }
    }
    else if (/^[0-9]+$/.test(value) === false) {
        //check if value is a variable
        validateVariableName(value);
        if (!_variableSet.has(value)) {
            throw new Error(`😑: Uff jaan! Variable '${value}' koi paila tmi? Declare korso hae?.`);
        }
    }
    return true;
}
function validateVariableName(variableName) {
    //A variable name must start with a letter, underscore or dollar sign. Subsequent characters can also be digits (0-9).
    if (!/^[a-zA-Z_$][a-zA-Z_0-9]*$/.test(variableName)) {
        throw new Error(`😑: Arey jaan! Variable name letter, underscore or dollar sign diye likha jay. '${variableName}' abar ki?`);
    }
}
function isValidString(input) {
    const regex = /^('([^']*)'|"([^"]*)")$/;
    const matches = regex.test(input.trim());
    return matches;
}
/*
console.log(isValidString(`"Hello"`)); //true
console.log(isValidString(`'Hello'`)); //true
console.log(isValidString(`"Hello`)); //false
console.log(isValidString(`'Hello`)); //false
console.log(isValidString(`Hello"`)); //false
console.log(isValidString(`Hello'`)); //false
console.log(isValidString(`"Hello" + "World"`)); //false
console.log(isValidString(`"Hello" + "World`)); //false
console.log(isValidString(`"Hello" + "`)); //false
console.log(isValidString(`"Hello" + q`)); //false
console.log(isValidString(`"Hello world"`)); //false
console.log(isValidString(`"Hello world`)); //false
console.log(isValidString(`'Hello world'`)); //true
*/
function parseConditional(text, lineNumber) {
    var _a, _b, _c, _d, _e;
    //extract 2 parts of the conditional, first remove the jodi keyword.
    text = text.replace("jodi", "").trim();
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
    const regex2 = /([a-zA-Z0-9]+)?\s*([a-zA-Z0-9]+)?\s*(hoy|na hoy|theke beshi|theke kom|[a-zA-Z0-9]+)?\s*(hoy|na hoy|[a-zA-Z0-9]+)?/;
    const matches = text.match(regex);
    const matches2 = text.match(regex2);
    let variable1 = "";
    let variable2 = "";
    let operator = "";
    let extraCondition = "";
    let garbage = "";
    //console.log(matches, matches2);
    if (matches) {
        //if jodi hoy tahole
        variable1 = matches[1];
        variable2 = matches[3];
        if (!variable1) {
            throw new Error(`😑: 1st value koi?`);
        }
        if (!variable2) {
            throw new Error(`😑: 2nd value koi?`);
        }
        validateOperand(variable1);
        validateOperand(variable2);
        operator = matches[2];
        //console.log(variable1, operator, variable2);
    }
    else if (matches2) {
        //console.log(text);
        //if hoy tahole
        variable1 = (_a = matches2[1]) === null || _a === void 0 ? void 0 : _a.trim();
        variable2 = (_b = matches2[2]) === null || _b === void 0 ? void 0 : _b.trim();
        if (!variable1) {
            throw new Error(`😑: 1st value koi?`);
        }
        if (!variable2) {
            throw new Error(`😑: 2nd value koi?`);
        }
        validateOperand(variable1);
        validateOperand(variable2);
        operator = (_c = matches2[3]) === null || _c === void 0 ? void 0 : _c.trim();
        extraCondition = (_d = matches2[4]) === null || _d === void 0 ? void 0 : _d.trim();
        garbage = (_e = matches2[5]) === null || _e === void 0 ? void 0 : _e.trim();
        if (!operator) {
            throw new Error(`Line: ${lineNumber + 2}: '${lines[lineNumber]}' mane ki? Operator koi?\nEivabe likho: \njodi (variable) (condition) (value) tahole \nor \njodi (variable) (value) (primary compare) (secondary compare) tahole`);
        }
        //extra condition is only required if operator is theke beshi or theke kom
        if (operator === "theke beshi" || operator === "theke kom" || operator === "theke beshi ba soman" || operator === "theke kom ba soman") {
            if (extraCondition === "na hoy") {
                extraCondition = "=== false";
            }
            else if (extraCondition === "hoy") {
                extraCondition = "=== true";
            }
            else if (!extraCondition) {
                throw new Error(`😑: '${operator}' ki? 'hoy' naki 'na hoy'?`);
            }
            else {
                throw new Error(`😑: Secondary condition just 'hoy' or 'na hoy' hoy`);
            }
            if (operator === "theke beshi") {
                operator = ">";
            }
            else if (operator === "theke kom") {
                operator = "<";
            }
            else if (operator === "theke beshi ba soman") {
                operator = ">=";
            }
            else if (operator === "theke kom ba soman") {
                operator = "<=";
            }
        }
        else if (operator === "hoy" || operator === "na hoy") {
            if (extraCondition !== "tahole") {
                //show ^ under the extraCondition 
                throw new Error(`😑: 'tahole' likhte hoy condition sesh e. Ar tumi ki likhso?`);
            }
            operator = operator === "hoy" ? "===" : "!==";
        }
        else {
            throw new Error(`😑: '${operator}' kono valid operator na babe`);
        }
        //console.log(variable1, operator, variable2, extraCondition);
    }
    else {
        throw new Error(`😑: '${lines[lineNumber]}' mane ki?.\nEivabe likho: \njodi (variable) (condition) (value) tahole \nor \njodi (variable) (value) (primary compare) (secondary compare) tahole`);
    }
    if (extraCondition === "tahole") {
        extraCondition = "";
    }
    if (garbage) {
        throw new Error(`😑: '${garbage}' mane ki?`);
    }
    return `if (${variable1} ${operator} ${variable2} ${extraCondition}) {`;
}
function rangeLoopParser(text) {
    //syntax: (number) bar
    //User can use $ to access the current value of the loop
    //user can write like: 10 bar ewrwejwnel 
    //any text after 'bar' will be considered as syntax error
    //check if any text after bar
    const regex = /(.*) bar\s*(.*)/;
    const matches = text.match(regex);
    if (matches) {
        const number = matches[1].trim();
        //if number is number both positive and negative and float
        if (/^-?\d*(\.\d+)?$/.test(number) === false) {
            throw new Error(`😑: Invalid value '${number}'`);
        }
        else if (Number(number) < 0) {
            throw new Error(`😑: Invalid value '${number}'. Range loop must be positive`);
        }
        //console.log(text, number, matches[2]);
        if (matches[2].trim() !== "") {
            throw new Error(`😑: Invalid token '${matches[2]}'`);
        }
        return `for (let $ = 1; $ <= ${matches[1]}; $++) {`;
    }
    return text;
}
function runCode(code) {
    const parsedCode = compile(code);
    try {
        eval(parsedCode);
    }
    catch (e) {
        console.log(`Ki korso eita?? ${e.message}`);
    }
}
function howToUse() {
    log(chalk.yellowBright('\nJaanLang\n'));
    log(chalk.blueBright('Program must start with ') + chalk.greenBright('hi jaan') + chalk.blueBright(' keyword and end with ') + chalk.greenBright('bye jaan') + chalk.blueBright(' keyword.\n'));
    log(chalk.blueBright('Declaring variable'));
    log(chalk.greenBright('\tdhoro <variableName> holo <value>'));
    log(chalk.blueBright('or'));
    log(chalk.greenBright('\tdhoro <variableName>'));
    log(chalk.blueBright('also you can assign value by = operator'));
    log(chalk.greenBright('\tdhoro <variableName> = <value>\n'));
    log(chalk.blueBright('Printing'));
    log(chalk.greenBright('\tbolo <value>\n'));
    log(chalk.blueBright('If statement'));
    log(chalk.greenBright('\tjodi <expression> tahole'));
    log(chalk.greenBright('\t\t<code>'));
    log(chalk.greenBright('\tnahole'));
    log(chalk.greenBright('\t\t<code>'));
    log(chalk.greenBright('\tkichu bolar nai\n'));
    log(chalk.blueBright('Else if statement'));
    log(chalk.greenBright('\tnahole jodi <expression> tahole'));
    log(chalk.greenBright('\t\t<code>'));
    log(chalk.greenBright('\tnahole jodi <expression> tahole\n'));
    log(chalk.blueBright('Range loop'));
    log(chalk.greenBright('\t<number> bar'));
    log(chalk.greenBright('\t\t<code>'));
    log(chalk.greenBright('\tkichu bolar nai\n'));
    log(chalk.blueBright('Comments'));
    log(chalk.greenBright('\t# This is a comment\n'));
    log(chalk.blueBright('Operators'));
    log(chalk.greenBright('\tholo -> ='));
    log(chalk.greenBright('\thoy -> =='));
    log(chalk.greenBright('\tna hoy -> !='));
    log(chalk.greenBright('\ttheke beshi -> >'));
    log(chalk.greenBright('\ttheke kom -> <'));
    log(chalk.greenBright('\ttheke beshi ba soman -> >='));
}
function showHelp() {
    console.log('\nJaanLang\n');
    console.log('\t--help | -h: show help');
    console.log('\t--doc | -d: show documentation');
    console.log('\t--version | -v: shows the compiler version\n');
}
for (const arg of process.argv) {
    if (arg.includes("--") || arg.includes("-")) {
        switch (arg) {
            case '--help':
            case '-h':
                showHelp();
                break;
            case '--doc':
            case '-d':
                howToUse();
            case '--version':
            case '-v':
                console.log(`JaanLang v${version}`);
        }
        process.exit(0);
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
    if (!endsWith) {
        filename = filename + ".jaan";
    }
    else {
        console.error(`Error: Invalid file type: ${filename}`);
        process.exit(1);
    }
}
//read file
readFile(filename, 'utf8', (err, data) => {
    if (err) {
        console.log(`Error reading file from disk: ${err}`);
    }
    else {
        runCode(data);
    }
});
