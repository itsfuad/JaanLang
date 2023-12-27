"use strict";
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
//manage indentation level
let indentationLevel = 0;
function compile(code) {
    //remove starting and trailing spaces
    lines = code.trim().split("\n");
    if (lines[0].trim() !== "hi jaan") {
        throw new Error("😑: Missing Program entrypoint: hi jaan");
    }
    indentationLevel += 4;
    if (lines[lines.length - 1].trim() !== "bye jaan") {
        throw new Error("😑: Missing Program exitpoint: bye jaan");
    }
    //remove first and last line
    lines.shift();
    lines.pop();
    let output = "";
    for (let i = 0; i < lines.length; i++) {
        //check indentation level
        //validate indentation level
        //if indentation level is not valid then throw error
        //remove starting and trailing spaces
        //lines[i] = lines[i].trim();
        //if comment then return
        if (lines[i][0] === "#") {
            continue;
        }
        //check close the block if blockStart is true and previous line is empty
        if (blockStart && lines[i] === "") {
            output += "}";
            console.log('Block closed');
            blockStart = false;
            indentationLevel -= 4;
            continue;
        }
        //if block is not closed and line is empty then throw error
        if (blockStart === true && i === lines.length - 1) {
            throw new Error(`😑: This block is not closed.\n${annotateErrorLine(i, "", 0)}`);
        }
        //if line does not start with jodi then return
        if (lines[i].startsWith("nahole jodi")) {
            if (!blockStart) {
                throw new Error(`😑: Conditional statement er block start hoy 'jodi' statement diye.\n${annotateErrorLine(i, "", lines[i].length - 1)}`);
            }
            output = output + "} else " + parseConditional(lines[i].replace("nahole jodi", ""), i);
        }
        else if (lines[i].trim().startsWith("jodi")) {
            const indents = lines[i].match(/^\s*/);
            console.log('Jodi start');
            if (indents) {
                const level = indents[0].length;
                console.log(level, indentationLevel);
                if (level < indentationLevel) {
                    throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
                }
                //level can be equal to indentationLevel or greater than indentationLevel. But only can be one level greater than indentationLevel and only if the previous block is not closed.
                if (level > indentationLevel + 4 && !blockStart) {
                    throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
                }
                else {
                    indentationLevel = level + 4;
                }
            }
            else {
                throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
            }
            blockStart = true;
            output += parseConditional(lines[i], i);
            if (!lines[i].endsWith("tahole")) {
                throw new Error(`😑: Conditional statement er block start korte sesh e 'tahole' likha lage pagol.\n${annotateErrorLine(i, "", lines[i].length - 1)}`);
            }
        }
        else if (lines[i].startsWith("nahole")) {
            if (!blockStart) {
                throw new Error(`😑: Conditional statement er block start hoy 'jodi' statement diye.\n${annotateErrorLine(i, "", lines[i].length - 1)}`);
            }
            output += "} else {";
        }
        else if (lines[i].startsWith("kichu bolar nai")) {
            output += "}";
            blockStart = false;
        }
        else if (lines[i].trim().startsWith("bolo")) {
            const indents = lines[i].match(/^\s*/);
            if (indents) {
                const level = indents[0].length;
                console.log(level, indentationLevel);
                if (level !== indentationLevel) {
                    throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
                }
            }
            else {
                throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
            }
            //find parameter of bolo
            const expression = lines[i].replace("bolo", "").trim();
            //extract all parameters by searching for variables and strings
            const regex = /(["'](.*)["'])|([a-zA-Z0-9]+)/g;
            const matches = expression.match(regex);
            console.log(matches);
            if (!matches) {
                const garbage = expression.replace(/["'].*["']/g, "").replace(/[a-zA-Z0-9]+/g, "").trim();
                if (garbage) {
                    throw new Error(`😑: Invalid token \`${garbage}\`.\n${annotateErrorLine(i, garbage)}`);
                }
                throw new Error(`😑: Bolo ki? kichu to bolo.\n${annotateErrorLine(i, "", lines[i].length)}`);
            }
            //validate expression
            //expression can be a string or a variable or a combination of both
            if (!isValidExpression(expression)) {
                throw new Error(`😑: Invalid expression '${expression}'.\n${annotateErrorLine(i, expression)}`);
            }
            //validate each parameter
            for (const match of matches) {
                validateOperand(match, i);
            }
            //use regex
            output += lines[i].replace(/(^\s)*bolo\s+(.*)$/gm, 'console.log($2);');
        }
        else if (lines[i].trim().startsWith("dhoro")) {
            //use regex
            //validate variable name
            //A variable name must start with a letter, underscore or dollar sign. Subsequent characters can also be digits (0-9).
            //check if variable is already declared
            //output += lines[i].replace(/(^\s)*dhoro\s+(.*)$/gm, 'let $2;');
            //variable can be be only declared, or declared and assigned a value. Capture variable name and value like (dhoro) (variableName) ((holo) (value)?)
            //example: dhoro a -> let a;
            //example: dhoro a holo -> let a = ; //error
            //example: dhoro a holo 10 -> let a = 10;
            //example: dhoro a holo "hello" -> let a = "hello";
            //example: dhoro a holo b -> let a = b; //validate b exists
            //example: dhoro a holo b holo -> let a = b; //error 'unexpected token holo' after b
            //example: dhoro a holo b holo 10 -> let a = b; //error 'unexpected token holo' after b
            //example: dhoro a holo b "hello" -> let a = b; //error 'unexpected teken "hello"' after b
            //example: dhoro a holo "hi -> let a = "hi; //error 'unexpected token EOF' after "hi
            //example: dhoro a holo "hi" -> let a = "hi";
            //example: dhoro a holo 'hi -> let a = 'hi; //error 'unexpected token EOF' after 'hi
            //example: dhoro a holo 'hi' -> let a = 'hi';
            //example: dhoro a holo 'hi" holo -> let a = 'hi'; //error 'mismatched quotes' on 'hi"
            const indents = lines[i].match(/^\s*/);
            if (indents) {
                const level = indents[0].length;
                console.log(level, indentationLevel);
                if (level !== indentationLevel) {
                    throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
                }
            }
            else {
                throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
            }
            //implement code
            //remove dhoro and split by "holo"
            const variableDeclaration = lines[i].replace("dhoro", "");
            //if variableDeclaration contains holo then split by holo
            const variableDeclarationParts = variableDeclaration.split("holo").map((part) => part.trim());
            if (variableDeclarationParts.length > 1) {
                if (!variableDeclarationParts[1]) {
                    throw new Error(`😑: Expected value after 'holo'. Missing value of '${variableDeclarationParts[0]}'.\n${annotateErrorLine(i, variableDeclarationParts[0])}`);
                }
                else {
                    //check if it is a variable or value
                    validateOperand(variableDeclarationParts[1], i);
                }
            }
            if (variableDeclarationParts.length > 2) {
                throw new Error(`😑: Unexpected token '${variableDeclarationParts[2]}'.\n${annotateErrorLine(i, variableDeclarationParts[2])}`);
            }
            validateVariableName(variableDeclarationParts[0], i);
            output += `let ${variableDeclarationParts[0]} = ${variableDeclarationParts[1] || 0};`;
            _variableSet.add(variableDeclarationParts[0]);
        }
        else if (/(.*) bar\s*(.*)/.test(lines[i])) {
            //indents
            const indents = lines[i].match(/^\s*/);
            if (indents) {
                const level = indents[0].length;
                console.log(level, indentationLevel);
                if (level !== indentationLevel) {
                    throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
                }
            }
            else {
                throw new Error(`😑: Invalid indentation.\n${annotateErrorLine(i, "", 0)}`);
            }
            output += rangeLoopParser(lines[i], i);
            blockStart = true;
            indentationLevel += 4;
        }
        else {
            output += lines[i];
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
    const tokens = expression.split(/\s/).filter((token) => token !== undefined && token !== "" && token !== " ");
    console.log(tokens);
    //validate each token
    for (const token of tokens) {
        //an operator can only be in the middle of 2 operands or minus sign can be before an operand but multiple minus sign cannot be before an operand. two minus sign can be before operand like a - -b. means a  - (-b) = a + b
        if (!validateOperand(token, -1)) {
            console.log("Operand", token);
            return false;
        }
        console.log("Operand", token);
    }
    //if expression ends with an operator then return false
    if (/[+\-*/]$/.test(expression)) {
        return false;
    }
    return tokens;
}
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
console.log(isValidExpression("a + -b")); //true a + (-b)
console.log(isValidExpression("a + +b")); //true
console.log(isValidExpression("a +")); //false expression cannot end with operator
console.log(isValidExpression("a -")); //false expression cannot end with operator
console.log(isValidExpression(`"Hello"`)); //true 
console.log(isValidExpression(`'Hello'`)); //true
console.log(isValidExpression(`"Hello`)); //false Unmatched quotes
console.log(isValidExpression(`'Hello`)); //false Unmatched quotes
console.log(isValidExpression(`Hello"`)); //false Unmatched quotes
console.log(isValidExpression(`Hello'`)); //false  Unmatched quotes
console.log(isValidExpression(`"Hello" + "World"`)); //true
console.log(isValidExpression(`"Hello" + "World`)); //false Unmatched quotes
console.log(isValidExpression(`"Hello" + "`)); //false
console.log(isValidExpression(`"Hello" + q`)); //true
console.log(isValidExpression(`"Hello" + q + "World  "`)); //false expression cannot end with operator
function validateOperand(value, lineNumber) {
    console.log(value);
    if (/["']/.test(value)) {
        console.log(`Value: ${value} is a string.`);
        //check if value is a string with proper quotes pair
        if (isValidString(value) === false) {
            value = value.replace(/^["']/, "").replace(/["']$/, "");
            //console.log(`Line ${lineNumber}: ${value} is a string with proper quotes pair.`);
            if (lineNumber === -1) {
                return false;
            }
            throw new Error(`😑: Dhur jaan! Strings similar quotation e rakha lage jano na?. "${value}" or '${value}' eivabe.\n${annotateErrorLine(lineNumber, value)}`);
        }
        console.log(`Value: ${value} is a string.`);
    }
    else if (/^[0-9]+$/.test(value) === false) {
        console.log(`Value: ${value} is a variable.`);
        //validateVariableName(value, lineNumber);
        if (lineNumber === -1) {
            return true;
        }
        if (!_variableSet.has(value)) {
            throw new Error(`😑: Uff jaan! Variable '${value}' koi paila tmi? Declare korso hae?.\n${annotateErrorLine(lineNumber, value)}`);
        }
    }
    else {
        console.log(`Value: ${value} is a number.`);
    }
    console.log(`Value: ${value} is a valid operand.`);
    return true;
}
function validateVariableName(variableName, lineNumber) {
    if (variableName.trim() === "$") {
        throw new Error(`😑: Dhur jaan! '$' is a reserved keyword. Tmi $ use korte parba na.\n${annotateErrorLine(lineNumber, "$")}`);
    }
    //A variable name must start with a letter, underscore or dollar sign. Subsequent characters can also be digits (0-9).
    if (!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(variableName)) {
        throw new Error(`😑: Arey jaan! Variable name letter, underscore or dollar sign diye likha jay. '${variableName}' abar ki?\n${annotateErrorLine(lineNumber, variableName)}`);
    }
}
function isValidString(input) {
    const regex = /^('([^']*)'|"([^"]*)")$/;
    return regex.test(input);
}
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
            throw new Error(`😑: 1st value koi?.\n${annotateErrorLine(lineNumber, "", lines[lineNumber].length)}`);
        }
        if (!variable2) {
            throw new Error(`😑: 2nd value koi?.\n${annotateErrorLine(lineNumber, "", lines[lineNumber].length)}`);
        }
        validateOperand(variable1, lineNumber);
        validateOperand(variable2, lineNumber);
        operator = matches[2];
        //console.log(variable1, operator, variable2);
    }
    else if (matches2) {
        //console.log(text);
        //if hoy tahole
        variable1 = (_a = matches2[1]) === null || _a === void 0 ? void 0 : _a.trim();
        variable2 = (_b = matches2[2]) === null || _b === void 0 ? void 0 : _b.trim();
        if (!variable1) {
            throw new Error(`😑: 1st value koi?.\n${annotateErrorLine(lineNumber, "", lines[lineNumber].length)}`);
        }
        if (!variable2) {
            throw new Error(`😑: 2nd value koi?.\n${annotateErrorLine(lineNumber, "", lines[lineNumber].length)}`);
        }
        validateOperand(variable1, lineNumber);
        validateOperand(variable2, lineNumber);
        operator = (_c = matches2[3]) === null || _c === void 0 ? void 0 : _c.trim();
        extraCondition = (_d = matches2[4]) === null || _d === void 0 ? void 0 : _d.trim();
        garbage = (_e = matches2[5]) === null || _e === void 0 ? void 0 : _e.trim();
        if (!operator) {
            throw new Error(`Line: ${lineNumber + 2}: '${lines[lineNumber]}' mane ki? Operator koi?\nEivabe likho: \njodi (variable) (condition) (value) tahole \nor \njodi (variable) (value) (primary compare) (secondary compare) tahole`);
        }
        //extra condition is only required if operator is theke beshi or theke kom
        if (operator === "theke beshi" || operator === "theke kom") {
            if (extraCondition === "na hoy") {
                extraCondition = "=== false";
            }
            else if (extraCondition === "hoy") {
                extraCondition = "=== true";
            }
            else if (!extraCondition) {
                throw new Error(`😑: '${operator}' ki? 'hoy' naki 'na hoy'?\n${annotateErrorLine(lineNumber, "", lines[lineNumber].length)}`);
            }
            else {
                throw new Error(`😑: Secondary condition just 'hoy' or 'na hoy' hoy.\n${annotateErrorLine(lineNumber, extraCondition)}`);
            }
            operator = operator === "theke beshi" ? ">" : "<";
        }
        else if (operator === "hoy" || operator === "na hoy") {
            if (extraCondition !== "tahole") {
                //show ^ under the extraCondition 
                throw new Error(`😑: 'tahole' likhte hoy condition sesh e. Ar tumi ki likhso?\n${annotateErrorLine(lineNumber, "", lines[lineNumber].length - 1)}`);
            }
            operator = operator === "hoy" ? "===" : "!==";
        }
        else {
            throw new Error(`😑: '${operator}' kono valid operator na babe.\n${annotateErrorLine(lineNumber, operator)}`);
        }
        //console.log(variable1, operator, variable2, extraCondition);
    }
    else {
        throw new Error(`Line: ${lineNumber + 2}: '${lines[lineNumber]}' mane ki?.\nEivabe likho: \njodi (variable) (condition) (value) tahole \nor \njodi (variable) (value) (primary compare) (secondary compare) tahole`);
    }
    if (extraCondition === "tahole") {
        extraCondition = "";
    }
    if (garbage) {
        throw new Error(`😑: '${garbage}' mane ki?.\n${annotateErrorLine(lineNumber, "", lines[lineNumber].length - 1)}`);
    }
    return `if (${variable1} ${operator} ${variable2} ${extraCondition}) {`;
}
function annotateErrorLine(lineNumber, message, position) {
    const lineText = `Line ${lineNumber + 2}:`;
    if (position) {
        return `${lineText} ${lines[lineNumber]}\n${" ".repeat(position + lineText.length + 1)}^`;
    }
    const line = lines[lineNumber];
    const index = line.indexOf(message);
    return `${lineText} ${line}\n${" ".repeat(index + lineText.length + 1)}^`;
}
function rangeLoopParser(text, lineNumber) {
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
            throw new Error(`😑: Invalid value '${number}'\n${annotateErrorLine(lineNumber, number)}`);
        }
        else if (Number(number) < 0) {
            throw new Error(`😑: Invalid value '${number}'. Range loop must be positive.\n${annotateErrorLine(lineNumber, number)}`);
        }
        //console.log(text, number, matches[2]);
        if (matches[2].trim() !== "") {
            throw new Error(`😑: Invalid token '${matches[2]}'\n${annotateErrorLine(lineNumber, matches[2])}`);
        }
        return `for (let $ = 1; $ <= ${matches[1]}; $++) {`;
    }
    return text;
}
const code = `
hi jaan
    dhoro a holo "hi"
    dhoro b holo 5
    dhoro c holo 10

    bolo b + c

    jodi a b theke beshi na hoy tahole
        bolo a


    jodi a b theke kom hoy tahole
        bolo b
        bolo "hi"

    10 bar
        bolo "Sorry jaan " + $

bye jaan
`;
//const compiledCode = compile(code);
//console.log(compiledCode);
