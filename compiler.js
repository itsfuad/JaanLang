import chalk from 'chalk';
export const log = console.log;
let _variableSet = new Map();
let sleepUsed = false;
const sleepCode = `
async function _jaanLangSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}`;
let lines = [];
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
const testCode = `hi jaan

#declare a variable
dhoro tmrCG holo 3.2
dhoro amrCG holo 3.8


#check if tmrCG is greater than amrCG
amrCG jodi tmrCG er beshi hoy tahole
    bolo "I love you"
nahole
    bolo "Breakup!!"
huh

#say sorry 5 times. '$' is a counter variable
5 bar
    bolo "Sorry " + $
huh


bye jaan`;
let startBlockStack = [];
let endBlockStack = [];
export function compile(code, terminal = true) {
    var _a, _b, _c, _d, _e, _f;
    try {
        //clear all previous compilation metadata
        let output = "";
        _variableSet.clear();
        _variableSet = new Map();
        startBlockStack = new Array();
        endBlockStack = new Array();
        sleepUsed = false;
        let i = 0;
        terminal ? log(chalk.yellowBright('Compiling...')) : null;
        //remove starting and trailing spaces
        lines = code.trim().split("\n");
        //log(lines);
        if (lines[0].trim() !== "hi jaan") {
            throw new Error(`Error at line 1:  Missing Program entrypoint 'hi jaan' on the first line 😩`);
        }
        if (lines[lines.length - 1].trim() !== "bye jaan") {
            throw new Error(`Error at line ${lines.length + 1}: Missing Program exitpoint 'bye jaan' on the last line 😩`);
        }
        //if any line after 'bye jaan' then throw error
        if (code.trimStart().endsWith("bye jaan") === false) {
            throw new Error(`Error at line ${lines.length + 1}: 'bye jaan' er pore r kicchu lekha jabe na. Extra lines remove koro 😩`);
        }
        //remove first and last line
        lines.shift();
        lines.pop();
        //console.log(lines.length + " lines");
        for (i = 0; i < lines.length; i++) {
            try {
                //remove starting and trailing spaces
                //lines[i] = lines[i].trim();
                //log("Line: " + i + ": " + lines[i]);
                //if comment then return
                if (lines[i].trim()[0] === "#") {
                    continue;
                }
                //if line is empty then return
                if (lines[i].trim() === "") {
                    continue;
                }
                if (lines[i].trim() === "nahole") { //Nahole block
                    //use stack to check if nahole is used with jodi
                    if (startBlockStack.length === 0) {
                        throw new Error(`'nahole' er age kothao 'jodi' ba nahole [..] jodi' use korso?😒|nahole`);
                    }
                    if (((_a = startBlockStack.at(-1)) === null || _a === void 0 ? void 0 : _a.blockname) === "jodi" || ((_b = startBlockStack.at(-1)) === null || _b === void 0 ? void 0 : _b.blockname) === "nahole jodi") {
                        output += "} else {";
                        startBlockStack.pop();
                        startBlockStack.push({ blockname: "nahole", line: i });
                        //console.log('Else block popped stack');
                        endBlockStack.pop();
                        endBlockStack.push({ blockname: "nahole", line: i });
                        continue;
                    }
                    else {
                        throw new Error(`'nahole' er age kothao 'jodi' ba nahole [..] jodi' use korso?😒|nahole`);
                    }
                }
                else if (lines[i].trim().startsWith("nahole")) { //Nahole jodi block with condition
                    /*
                    lines[i] = lines[i].replace("nahole", "").trim();
                    output += "} else if (" + parseConditional(lines[i]) + ") {";
                    continue;
                    */
                    //use stack to check if nahole is used with jodi. Nahole is "else if" in bangla
                    if (startBlockStack.length === 0) {
                        throw new Error(`'nahole jodi' er age kothao 'jodi' ba nahole [..] jodi' use korso?😒|nahole jodi`);
                    }
                    if (((_c = startBlockStack.at(-1)) === null || _c === void 0 ? void 0 : _c.blockname) === "jodi" || ((_d = startBlockStack.at(-1)) === null || _d === void 0 ? void 0 : _d.blockname) === "nahole jodi") {
                        output += "} else if (" + parseConditional(lines[i].replace("nahole", "").trim()) + ") {";
                        startBlockStack.pop();
                        startBlockStack.push({ blockname: "nahole jodi", line: i });
                        //console.log('Else if block popped stack');
                        endBlockStack.pop();
                        endBlockStack.push({ blockname: "nahole jodi", line: i });
                        continue;
                    }
                    else {
                        throw new Error(`'nahole jodi' er age kothao 'jodi' ba nahole [..] jodi' use korso?😒|nahole jodi`);
                    }
                }
                else if (lines[i].trim().match(/(.*)\s+(jodi)\s+(.*)/)) { //Jodi block
                    //log("Conditional statement found: " + lines[i]);
                    output += "\nif (" + parseConditional(lines[i]) + ") {";
                    //blockStart = true;
                    startBlockStack.push({ blockname: "jodi", line: i });
                    endBlockStack.push({ blockname: "jodi", line: i });
                    //console.log('If block pushed');
                    continue;
                }
                else if (lines[i].trim().startsWith("huh")) {
                    //end of block
                    //output += "\n}";
                    if (startBlockStack.length === 0) {
                        throw new Error(`Khoda amr😑!! Kono block start korso j 'huh' likhso?😒|huh`);
                    }
                    //console.log(`start stacks: `, startBlockStack);
                    //console.log(`end stacks: `, endBlockStack);
                    //console.log(`Last block start: ${startBlockStack.at(-1)?.blockname}`);
                    //console.log(`Last block end: ${endBlockStack.at(-1)?.blockname}`);
                    if (((_e = startBlockStack.at(-1)) === null || _e === void 0 ? void 0 : _e.blockname) === ((_f = endBlockStack.at(-1)) === null || _f === void 0 ? void 0 : _f.blockname)) {
                        startBlockStack.pop();
                        endBlockStack.pop();
                    }
                    output += "\n}";
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
                        throw new Error(`Bolo ki?😑 kichu to bolo.|bolo`);
                    }
                    //validate expression
                    //expression can be a string or a variable or a combination of both
                    if (!isValidExpression(expression)) {
                        throw new Error(`Invalid expression😑 '${expression}'|${expression}`);
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
                    //console.log(variableDeclarationParts);
                    if (variableDeclarationParts.length > 1) {
                        if (!variableDeclarationParts[1]) {
                            throw new Error(`Expected value after 'holo'. '${variableDeclarationParts[0]} er value koi?😤'|holo`);
                        }
                        else {
                            //check if it is a variable or value
                            validateOperand(variableDeclarationParts[1]);
                        }
                    }
                    if (variableDeclarationParts.length > 2) {
                        throw new Error(`Ajaira token😑 after ${variableDeclarationParts[1]}. Found '${variableDeclarationParts[2]}'|${variableDeclarationParts[2]}`);
                    }
                    validateVariableName(variableDeclarationParts[0]);
                    //if variable is already declared then throw error
                    if (_variableSet.has(variableDeclarationParts[0])) {
                        throw new Error(`'${variableDeclarationParts[0]} to ekbar declare korso. Onno nam dao😑'|${variableDeclarationParts[0]}`);
                    }
                    let value = variableDeclarationParts[1];
                    if (value) {
                        const type = operandType(value);
                        switch (type) {
                            case "string":
                                value = String(value);
                                break;
                            case "number":
                                value = Number(value);
                                break;
                            case "variable":
                                value = _variableSet.get(value);
                                break;
                        }
                    }
                    output += `\nlet ${variableDeclarationParts[0]} = ${value};`;
                    _variableSet.set(variableDeclarationParts[0], value);
                }
                else if (/(.*)\s*bar\s*(\S*)\s*(.*)/.test(lines[i])) {
                    output += rangeLoopParser(lines[i], i);
                }
                else if (/(\S*)\s*(\S*)\s*wait koro\s*(.*)/.test(lines[i])) {
                    const match = lines[i].match(/(\S*)\s*(\S*)\s*wait koro\s*(.*)/);
                    if (match) {
                        //log(match);
                        if (!match[2]) {
                            throw new Error(`Time unit koi?😑|wait`);
                        }
                        if (!["min", "sec"].includes(match[2].trim())) {
                            throw new Error(`Invalid time unit😑 '${match[2]}'. Use 'sec' or 'min' as Unit|${match[2]}`);
                        }
                        if (match[3]) {
                            throw new Error(`Hae??😑 Invalid token '${match[2]}'|${match[2]}`);
                        }
                        const time = validateNumber(match[1].trim(), 'time count');
                        sleepUsed = true;
                        const ms = match[2].trim() === "sec" ? time * 1000 : time * 1000 * 60;
                        output += `\nawait _jaanLangSleep(${ms});\n`;
                    }
                }
                else {
                    const token = lines[i].trim().split(/\s+/)[0];
                    //log(token + " found");
                    throw new Error(`Ajaira token😑 '${token}'|${token}`);
                }
            }
            catch (e) {
                let annotatedLine = `${lines[i].trim()}\n`;
                //console.log(i);
                //add spaces before ^ to align with the error message
                const error = e.message;
                if (!error) {
                    throw new Error("Allah!! ki jani hoise.😨 Ami kichu jani na🥺");
                }
                const msg = error.split("|")[0];
                let token = error.split("|")[1];
                if (token) {
                    if (token.startsWith("#")) {
                        if (token.includes("end")) {
                            //show the annotation at the end of the line
                            annotatedLine += " ".repeat(lines[i].trim().length);
                            annotatedLine += terminal ? chalk.yellowBright("^") : "^";
                        }
                    }
                    else if (lines[i].trim().includes(token)) {
                        annotatedLine += " ".repeat(lines[i].trim().indexOf(token));
                        for (let j = 0; j < token.length; j++) {
                            annotatedLine += terminal ? chalk.yellowBright("~") : "~";
                        }
                    }
                }
                //console.log(startBlockStack);
                //console.log(endBlockStack);
                throw new Error(`Error at line ${i + 2}: ${msg}\n\n${annotatedLine}\nCompilation failed🥺😭\n`);
            }
        }
        //console.log(startBlockStack);
        //console.log(endBlockStack);
        //if block is not closed and line is empty then throw error
        if (startBlockStack.length || endBlockStack.length) {
            //console.log(startBlockStack);
            //console.log(endBlockStack);
            if (startBlockStack.length > 0) {
                throw new Error(`Error at line ${startBlockStack[0].line + 2}:  Block end korte 'huh' likho nai😑.\nCompilation failed🥺😭\n`);
            }
            else {
                throw new Error(`Error:  Kono ekta block end koro nai😑.\nCompilation failed🥺😭\n`);
            }
        }
        //wrap the code in a async function
        output = `(async () => {${output}\n\n/*[END_CODE]*/})();`;
        if (sleepUsed) {
            output = sleepCode + output;
        }
        terminal ? log(chalk.greenBright('Compiled successfully')) : null;
        return output;
    }
    catch (e) {
        throw new Error(e.message);
    }
}
function isValidExpression(expression) {
    try {
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
    catch (e) {
        throw new Error(e.message);
    }
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
    value = value.trim();
    try {
        return !!operandType(value);
    }
    catch (e) {
        throw new Error(e.message);
    }
}
function operandType(value) {
    try {
        //returns "string", "number", "variable"
        value = value.trim();
        if (/["']/.test(value)) {
            if (isValidString(value) === false) {
                //remove starting or trailing " or '
                const token = value.replace(/^["']|["']$/g, "");
                throw new Error(`Dhur jaan!😑 Strings similar quotation e rakha lage jano na?. "${token}" or '${token}' eivabe.|${value}`);
            }
            return "string";
        }
        else if (/^(-)?[0-9]+(\.[0-9]+)?$/.test(value)) { // Updated regex to include floats
            return "number";
        }
        else {
            validateVariableName(value);
            if (!_variableSet.has(value)) {
                throw new Error(`Uff jaan!😑 Variable '${value}' koi paila tmi? Declare korso hae?.|${value}`);
            }
            return "variable";
        }
    }
    catch (e) {
        throw new Error(e.message);
    }
}
function validateVariableName(variableName) {
    try {
        //A variable name must start with a letter, underscore sign. Subsequent characters can also be digits (0-9).
        if (!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(variableName)) {
            throw new Error(`Arey jaan😑! Variable name letter, underscore diye likha jay. '${variableName}' abar ki?|${variableName}`);
        }
        //check if variable name is a reserved keyword
        if (keywords[variableName]) {
            throw new Error(`Arey jaan😑! '${variableName}' to reserved keyword. Eita variable er nam dite parba nah.|${variableName}`);
        }
    }
    catch (e) {
        throw new Error(e.message);
    }
}
function isValidString(input) {
    try {
        const regex = /^('([^']*)'|"([^"]*)")$/;
        const matches = regex.test(input.trim());
        return matches;
    }
    catch (e) {
        throw new Error(e.message);
    }
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
    try {
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
            //console.log(`var1: ${var1}, jodi: ${jodi}, var2: ${var2}`);
            if (!var1) {
                throw new Error("Gadha reh😞 Expected a valid 1st variable or value");
            }
            if (!jodi || jodi !== "jodi") {
                throw new Error(`Gadha reh😞 Expected 'jodi' after variable or value|${var1}`);
            }
            if (!var2) {
                throw new Error(`Gadha reh😞 Expected a valid 2nd variable or value|${jodi}`);
            }
            let operator = match[4];
            if (!operator) {
                throw new Error(`Gadha reh😞 Operator ke likhbe?|${var2}`);
            }
            if (!match[5]) {
                throw new Error(`Arey jaan😑! last e 'tahole' likha lage after condition expression|${operator}`);
            }
            else if (match[5] !== "tahole") {
                throw new Error(`Arey jaan😑! last e 'tahole' likha lage after condition expression. Tumi likhso '${match[5]}'|${match[5]}`);
            }
            expression += validateConditionExpression(var1, var2, operator);
        }
        return expression;
    }
    catch (e) {
        throw new Error(e.message);
    }
}
//valid expressions
//variable jodi variable (...)
//variable jodi value["string"|number] (...)
//value["string"|number] jodi value["string"|number] (...)
//invalid expressions
//value jodi variable (...) //should be variable jodi value //variable should be on left side
function validateConditionExpression(var1, var2, operator) {
    try {
        if (operandType(var1) != "variable" && operandType(var2) === "variable") {
            throw new Error(`Arey jaan😑! Variable should be on the left side. Like '${var2} jodi ${var1} ${operator}|${var2}`);
        }
        else if (operandType(var2) === "variable" && ["hoy", "na hoy"].includes(operator)) {
            throw new Error(`Umm.. Thik ache but '${var1} jodi ${var2} er soman ${operator}' eivabe likhle dekhte sundor lage. Eivabe likho|${operator}`);
        }
        else if (operandType(var2) != "variable" && operator === "er soman hoy") {
            throw new Error(`Umm.. Thik ache but '${var1} jodi ${var2} hoy' eivabe likhle dekhte sundor lage. Eivabe likho|er soman hoy|${operator}`);
        }
        else if (operandType(var2) != "variable" && operator === "er soman na hoy") {
            throw new Error(`Umm.. Thik ache but '${var1} jodi ${var2} na hoy' eivabe likhle dekhte sundor lage. Eivabe likho|er soman na hoy|${operator}`);
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
    catch (e) {
        throw new Error(e.message);
    }
}
function rangeLoopParser(text, line) {
    try {
        //syntax: (number) bar
        //User can use $ to access the current value of the loop
        //user can write like: 10 bar ewrwejwnel 
        //any text after 'bar' will be considered as syntax error
        //check if any text after bar
        const regex = /(.*)\s*bar\s*(\S*)\s*(.*)/;
        const matches = text.match(regex);
        if (matches) {
            const number = matches[1].trim();
            const n = validateNumber(number, 'loop');
            const hasLoopingVariable = matches[2];
            if (hasLoopingVariable) {
                //log(hasLoopingVariable);
                validateVariableName(hasLoopingVariable);
                if (_variableSet.has(hasLoopingVariable)) {
                    throw new Error(`'${hasLoopingVariable}' already declare kora ase. Onno nam dao 😑|${hasLoopingVariable}`);
                }
                //log(matches[3]);
                if (matches[3].trim() === "") {
                    //log(1);
                    throw new Error(`Expected 'dhore' after ${hasLoopingVariable}|#end`);
                }
                else if (matches[3].trim() !== "dhore") {
                    //log(2);
                    throw new Error(`Expected 'dhore' after ${hasLoopingVariable}. Found '${matches[3]}'|${matches[3]}`);
                }
                _variableSet.set(hasLoopingVariable, 0);
            }
            const loopVariable = hasLoopingVariable ? hasLoopingVariable : "$";
            startBlockStack.push({ blockname: `${n} bar`, line: line });
            endBlockStack.push({ blockname: `${n} bar`, line: line });
            return `\nfor (let ${loopVariable} = 1; ${loopVariable} <= ${number}; ${loopVariable}++) {`;
        }
        return text;
    }
    catch (e) {
        throw new Error(e.message);
    }
}
function sentenceCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function validateNumber(number, usedFor) {
    const type = operandType(number.trim());
    const integer = usedFor === 'loop';
    if (type === "number") {
        //if not positive integer then throw error
        if (Number(number) < 0) {
            throw new Error(`Negative number diso kno?😑 '${number}'. ${sentenceCase(usedFor)}ing variable always positive${integer ? " integer" : ""} number hoy jaan|${number}`);
        }
        //if not integer then throw error
        if (integer && !Number.isInteger(Number(number))) {
            throw new Error(`Ultapalta value diso kno?😑 '${number}'. ${sentenceCase(usedFor)}ing variable always positive integer number hoy jaan|${number}`);
        }
    }
    else if (type === "string") {
        throw new Error(`String diso kon dukkhe?😑 '${number}'. ${sentenceCase(usedFor)}ing variable always positive${integer ? " integer" : ""} number hoy jaan|${number}`);
    }
    else {
        let value = _variableSet.get(number);
        if (!value) {
            throw new Error(`${number} er value koi? ki likhso egula hae?? 😑|${number}`);
        }
        else {
            //console.log(typeof value, value);
            if (typeof value === "number") {
                if (Number(value) < 0) {
                    throw new Error(`'${number}' er value '${value}'. ${sentenceCase(usedFor)}ing variable always positive${integer ? " integer" : ""} number hoy jaan|${number}`);
                }
                //if not integer then throw error
                if (integer && !Number.isInteger(Number(value))) {
                    throw new Error(`'${number}' er value '${value}'. ${sentenceCase(usedFor)}ing variable always positive integer number hoy jaan|${number}`);
                }
            }
            else {
                throw new Error(`'${number}' ba '${value}' diye ${usedFor} kora jay na😑. ${sentenceCase(usedFor)}ing variable always positive${integer ? " integer" : ""} number hoy jaan|${number}`);
            }
        }
        return value;
    }
    return Number(number);
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
export function runCode(code) {
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
