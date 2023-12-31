#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'fs';
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
    "huh": true,
};
const keywordBoolean = {
    "hoy": true,
    "na": true,
    "and": true,
    "or": true,
    "er": true,
    "theke": true,
    "kom": true,
    "beshi": true,
    "soman": true,
};
const keywordsLoop = {
    "bar": true
};
const keywords = Object.assign(Object.assign(Object.assign({}, keywordsControl), keywordsLoop), keywordBoolean);
function compile(code) {
    log(chalk.yellowBright('Compiling...'));
    //remove starting and trailing spaces
    lines = code.trim().split("\n");
    if (lines[0].trim() !== "hi jaan") {
        throw new Error("Missing Program entrypoint 🤦‍♀️: hi jaan");
    }
    if (lines[lines.length - 1].trim() !== "bye jaan") {
        throw new Error("Missing Program exitpoint 🤦‍♀️: bye jaan");
    }
    //remove first and last line
    lines.shift();
    lines.pop();
    let output = "";
    for (let i = 0; i < lines.length; i++) {
        try {
            //remove starting and trailing spaces
            //lines[i] = lines[i].trim();
            //if comment then return
            if (lines[i].trim()[0] === "#") {
                continue;
            }
            //if line is empty then return
            if (lines[i].trim() === "") {
                continue;
            }
            //if block is not closed and line is empty then throw error
            if (blockStart === true && i === lines.length - 1) {
                throw new Error(`Block is not closed. 'huh' likhe sesh koro r ki korba?😑`);
            }
            //if line does not start with jodi then return
            if (lines[i].match(/(.*)\s+(jodi)\s+(.*)/)) {
                if (!blockStart) {
                    output += "\nif (" + parseConditional(lines[i]) + ") {";
                    blockStart = true;
                    continue;
                }
            }
            if (lines[i].trim() === "nahole") {
                output += "} else {";
                continue;
            }
            else if (lines[i].trim().startsWith("nahole")) {
                lines[i] = lines[i].replace("nahole", "").trim();
                output += "} else if (" + parseConditional(lines[i]) + ") {";
                continue;
            }
            else if (lines[i].trim().startsWith("huh")) {
                //end of block
                output += "\n}";
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
                        throw new Error(`Invalid token😑 '${garbage}'|${garbage}`);
                    }
                    throw new Error(`Bolo ki?😑 kichu to bolo.`);
                }
                //validate expression
                //expression can be a string or a variable or a combination of both
                if (!isValidExpression(expression)) {
                    throw new Error(`Invalid expression😑 '${expression}'`);
                }
                //validate each parameter
                for (const match of matches) {
                    validateOperand(match);
                }
                //use regex
                output += lines[i].replace(/(^\s)*bolo\s+(.*)$/gm, '\nconsole.log($2);');
            }
            else if (lines[i].trim().startsWith("dhoro")) {
                //implement code
                //remove dhoro and split by "holo"
                const variableDeclaration = lines[i].replace("dhoro", "");
                //if variableDeclaration contains holo then split by holo
                const variableDeclarationParts = variableDeclaration.split("holo").map((part) => part.trim());
                if (variableDeclarationParts.length > 1) {
                    if (!variableDeclarationParts[1]) {
                        throw new Error(`Expected value after 'holo'. '${variableDeclarationParts[0]} er value koi?😤'`);
                    }
                    else {
                        //check if it is a variable or value
                        validateOperand(variableDeclarationParts[1]);
                    }
                }
                if (variableDeclarationParts.length > 2) {
                    throw new Error(`Unexpected token😑 after ${variableDeclarationParts[1]}. Found '${variableDeclarationParts[2]}'|${variableDeclarationParts[2]}`);
                }
                validateVariableName(variableDeclarationParts[0]);
                output += `\nlet ${variableDeclarationParts[0]} = ${variableDeclarationParts[1] || 0};`;
                _variableSet.add(variableDeclarationParts[0]);
            }
            else if (/(.*) bar\s*(.*)/.test(lines[i])) {
                output += rangeLoopParser(lines[i]);
                blockStart = true;
            }
            else {
                const token = lines[i].trim().split(/\s+/)[0];
                throw new Error(`Invalid token😑 '${token}'|${token}`);
            }
        }
        catch (e) {
            //console.log(`Line ${i + 2}: ${e.message}`);
            let annotatedLine = `${lines[i].trim()}\n`;
            //add spaces before ^ to align with the error message
            const error = e.message;
            if (!error) {
                throw new Error("Unexpected error occured");
            }
            const msg = error.split("|")[0];
            let token = error.split("|")[1];
            if (token) {
                annotatedLine += "~".repeat(lines[i].trim().indexOf(token)) + "^\n";
            }
            throw new Error(`Line ${i + 2}: ${msg}\n\n${annotatedLine}\nCompilation failed🥺😭\n`);
        }
    }
    log(chalk.greenBright('Compiled successfully'));
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
    return !!operandType(value);
}
function operandType(value) {
    //returns "string", "number", "variable"
    if (/["']/.test(value)) {
        if (isValidString(value) === false) {
            //remove starting or trailing " or '
            const token = value.replace(/^["']|["']$/g, "");
            throw new Error(`Dhur jaan!😑 Strings similar quotation e rakha lage jano na?. "${token}" or '${token}' eivabe.|${value}`);
        }
        return "string";
    }
    else if (/^[0-9]+$/.test(value) === false) {
        validateVariableName(value);
        if (!_variableSet.has(value)) {
            throw new Error(`Uff jaan!😑 Variable '${value}' koi paila tmi? Declare korso hae?.|${value}`);
        }
        return "variable";
    }
    return "number";
}
function validateVariableName(variableName) {
    //A variable name must start with a letter, underscore or dollar sign. Subsequent characters can also be digits (0-9).
    if (!/^[a-zA-Z_$][a-zA-Z_0-9]*$/.test(variableName)) {
        throw new Error(`Arey jaan😑! Variable name letter, underscore or dollar sign diye likha jay. '${variableName}' abar ki?|${variableName}`);
    }
    //check if variable name is a reserved keyword
    if (keywords[variableName]) {
        throw new Error(`Arey jaan😑! '${variableName}' to reserved keyword. Eita variable er nam dite parba nah.|${variableName}`);
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
function parseConditional(text) {
    //extract 2 parts of the conditional, first remove the jodi keyword.
    text = text.trim();
    //split by and, or
    const parts = text.split(/(and|or)/).filter((part) => part !== undefined && part !== "" && part !== " ").map((part) => part.trim());
    let expression = "";
    let lastCondition = "";
    const regex = /([a-z-A-Z0-9'"_]+)?\s*(\bjodi\b)?\s*([a-z-A-Z0-9'"_]+)?\s*(\ber kom ba soman hoy\b|\ber kom ba soman na hoy\b|\ber beshi ba soman hoy\b|\ber beshi ba soman na hoy\b|\ber beshi hoy\b|\ber beshi na hoy\b|\ber kom hoy\b|\ber kom na hoy\b|\ber soman hoy\b|\ber soman na hoy\b|\bhoy\b|\bna hoy\b)?\s*((.*)+)?/;
    //check if it is a conditional statement
    for (let i = 0; i < parts.length; i++) {
        if (lastCondition && lastCondition === parts[i]) {
            throw new Error(`Eksathe duibar same jinish use jay??😷'${lastCondition} ${parts[i]}'|${parts[i]}`);
        }
        if (parts[i] === "and" || parts[i] === "or") {
            expression += ` ${parts[i] === 'and' ? '&& ' : '|| '}`;
            lastCondition = parts[i];
            continue;
        }
        lastCondition = "";
        const match = parts[i].match(regex);
        if (!match) {
            throw new Error("Aigula ki?😐 Invalid syntax");
        }
        const var1 = match[1];
        const jodi = match[2];
        const var2 = match[3];
        if (!var1) {
            throw new Error("Gadha reh😞 Expected a valid 1st variable or value");
        }
        if (!jodi || jodi !== "jodi") {
            throw new Error("Gadha reh😞 Expected 'jodi' after variable or value");
        }
        if (!var2) {
            throw new Error("Gadha reh😞 Expected a valid 2nd variable or value");
        }
        let operator = match[4];
        if (!operator) {
            throw new Error("Gadha reh😞 Operator ke likhbe?");
        }
        if (!match[5]) {
            throw new Error(`Arey jaan😑! last e 'tahole' likha lage after condition expression`);
        }
        else if (match[5] !== "tahole") {
            throw new Error(`Arey jaan😑! last e 'tahole' likha lage after condition expression. Tumi likhso '${match[5]}'`);
        }
        expression += validateConditionExpression(var1, var2, operator);
    }
    return expression;
}
//valid expressions
//variable jodi variable (...)
//variable jodi value["string"|number] (...)
//value["string"|number] jodi value["string"|number] (...)
//invalid expressions
//value jodi variable (...) //should be variable jodi value //variable should be on left side
function validateConditionExpression(var1, var2, operator) {
    if (operandType(var1) != "variable" && operandType(var2) === "variable") {
        throw new Error(`Arey jaan😑! Variable should be on the left side. Like '${var2} jodi ${var1} ${operator}|${var2}`);
    }
    else if (operandType(var2) === "variable" && ["hoy", "na hoy"].includes(operator)) {
        throw new Error(`Umm.. Thik ache but '${var1} jodi ${var2} er soman ${operator}' eivabe likhle dekhte sundor lage. Eivabe likho|${operator}`);
    }
    else if (operandType(var2) != "variable" && operator === "er soman hoy") {
        throw new Error(`Umm.. Thik ache but '${var1} jodi ${var2} hoy' eivabe likhle dekhte sundor lage. Eivabe likho|er soman hoy`);
    }
    else if (operandType(var2) != "variable" && operator === "er soman na hoy") {
        throw new Error(`Umm.. Thik ache but '${var1} jodi ${var2} na hoy' eivabe likhle dekhte sundor lage. Eivabe likho|er soman na hoy`);
    }
    switch (operator) {
        case 'hoy':
        case 'er soman hoy':
            operator = '===';
            break;
        case 'na hoy':
        case 'er soman na hoy':
            operator = '!==';
            break;
        case 'er kom hoy':
            operator = '<';
            break;
        case 'er kom na hoy':
            operator = '>';
            break;
        case 'er beshi hoy':
            operator = '>';
            break;
        case 'er beshi na hoy':
            operator = '<';
            break;
        case 'er kom ba soman hoy':
            operator = '<=';
            break;
        case 'er kom ba soman na hoy':
            operator = '>=';
            break;
        case 'er beshi ba soman hoy':
            operator = '>=';
            break;
        case 'er beshi ba soman na hoy':
            operator = '<=';
            break;
        default:
            throw new Error(`Hayre pagol🤦‍♀️ Invalid operator '${operator}'. Valid operators are: er soman, theke beshi, theke kom, theke beshi ba soman, theke kom ba soman|${operator}`);
    }
    return `${var1} ${operator} ${var2}`;
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
            throw new Error(`Eita ki likhso?😑 Invalid value '${number}'`);
        }
        else if (Number(number) < 0) {
            throw new Error(`Eita ki likhso?😑 Invalid value '${number}'. Range loop must be positive|${number}`);
        }
        if (matches[2].trim() !== "") {
            throw new Error(`Hae??😑 Invalid token '${matches[2]}'|${matches[2]}`);
        }
        return `\nfor (let $ = 1; $ <= ${matches[1]}; $++) {`;
    }
    return text;
}
const code = `
hi jaan
    # This is a comment
    dhoro id holo 6
    dhoro kichuEkta holo id
    dhoro amrNaam holo "Tamanna"
    dhoro a
    dhoro b

    a jodi 10 er theke beshi hoy tahole
        bolo "Hello World"
    nahole a jodi 0 er soman hoy tahole
        bolo "a is 3"
    nahole
        bolo "a is not 0 and not greater than 10"
    huh

    a jodi b er soman hoy tahole
        bolo "Hello World"
    nahole
        bolo "a is not 0 and not greater than 10"
    huh


    10 bar
        bolo "Sorry Jaan " + $
    huh

bye jaan
`;
/*
const str1 = 'a jodi 10 er theke beshi hoy';
const str2 = 'a jodi 10 er theke kom hoy tahole';
const str3 = 'a jodi 10 er soman hoy tahole';
const str4 = 'a jodi 10 er theke beshi ba soman hoy tahole';

const str5 = 'a jodi 10 er theke beshi na hoy tahole';
const str6 = 'a jodi 10 er theke kom na hoy tahole';
const str7 = 'a jodi 10 er soman na hoy tahole';
*/
//variable: "Hello", a, 10, 10.5
//jodi: jodi
//er: er
//operator: soman, theke beshi, theke kom, theke beshi ba soman, theke kom ba soman
//modifier: hoy, na hoy
//tahole: tahole
// for a 10 er soman hoy tahole
// variable: a
// jodi: undefined
//make regex that can match all the patterns. each group will be optional. if a group is not matched then it will be undefined
//pattern (variable) (jodi) (variable) (er) (operator) (modifier) (tahole)
//const regex = /([a-z-A-Z0-9'"_]+)?\s*(\bjodi\b)?\s*([a-z-A-Z0-9'"_]+)?\s*(\ber\b)?\s*(\btheke\s+kom\s+ba\s+soman\b|\btheke\s+beshi\s+ba\s+soman\b|\btheke\s+beshi\b|\btheke\s+kom\b|\bsoman\b|)?\s*(\bna\s+hoy|hoy\b)?\s*(\btahole\b)?/;
function runCode(code) {
    try {
        const parsedCode = compile(code);
        try {
            log(chalk.yellowBright('Running...'));
            eval(parsedCode);
        }
        catch (e) {
            log(chalk.yellowBright(`Ki korso eita?? Internal error: ${e.message}`));
        }
    }
    catch (e) {
        log(chalk.redBright(e.message));
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
    log(chalk.greenBright('\t<val> jodi <val> <comp> tahole'));
    log(chalk.greenBright('\tnahole'));
    log(chalk.greenBright('\tkichu bolar nai\n'));
    log(chalk.blueBright('Else if statement'));
    log(chalk.greenBright('\tnahole <val> jodi <val> <comp> tahole\n'));
    log(chalk.blueBright('Range loop'));
    log(chalk.greenBright('\t<number> bar'));
    log(chalk.greenBright('\tkichu bolar nai\n'));
    log(chalk.blueBright('Comments'));
    log(chalk.greenBright('\t# This is a comment\n'));
    log(chalk.blueBright('Operators'));
    log(chalk.greenBright('\tholo -> ='));
    log(chalk.greenBright('\ter soman -> =='));
    log(chalk.greenBright('\thoy -> =='));
    log(chalk.greenBright('\tna hoy -> !='));
    log(chalk.greenBright('\ttheke beshi -> >'));
    log(chalk.greenBright('\ttheke kom -> <'));
    log(chalk.greenBright('\ttheke beshi ba soman -> >='));
    log(chalk.greenBright('\ttheke kom ba soman -> <='));
}
function showHelp() {
    log(chalk.yellowBright('\nJaanLang\n'));
    console.log('\t--help | -h: show help');
    console.log('\t--doc | -d: show documentation');
    console.log('\t--compile|-c <filename>: compile and save to file');
    console.log('\t--version | -v: shows the compiler version\n');
}
try {
    for (let i = 2; i < process.argv.length; i++) {
        if (process.argv[i].includes("--") || process.argv[i].includes("-")) {
            switch (process.argv[i]) {
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
                    break;
                case '--compile':
                case '-c':
                    //compile and save to file
                    let filename = process.argv[i + 1];
                    filename = processFile(filename);
                    //read file
                    const filedata = readFileData(filename);
                    //compile
                    const compiledCode = compile(filedata);
                    //save to file
                    const outputFilename = filename.replace(".jaan", ".js");
                    writeFileSync(outputFilename, compiledCode);
                    break;
            }
            process.exit(0);
        }
    }
}
catch (e) {
    log(chalk.redBright(e.message));
    process.exit(1);
}
const filename = process.argv[2];
function processFile(filename) {
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
    return filename;
}
function readFileData(filename) {
    //read file
    let filedata = readFileSync(filename, 'utf-8');
    return filedata;
}
runCode(readFileData(processFile(filename)));
