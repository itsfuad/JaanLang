#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import { config } from 'dotenv';
config();
import { compile, log, runCode } from './compiler.js';
//get version from package.json
const version = process.env.npm_package_version || 'Development';
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
    log(chalk.greenBright('\thuh\n'));
    log(chalk.blueBright('Else if statement'));
    log(chalk.greenBright('\tnahole <val> jodi <val> <comp> tahole\n'));
    log(chalk.blueBright('Range loop'));
    log(chalk.greenBright('\t<number> bar'));
    log(chalk.greenBright('\thuh\n'));
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
    let msg = e.message;
    const line = msg.match(/Line [0-9]+/);
    if (line) {
        msg = msg.replace(line[0], `Error at ${line[0]}`);
    }
    log(chalk.redBright(msg));
    process.exit(1);
}
const filename = process.argv[2];
function processFile(filename) {
    if (!filename) {
        console.error('Error: No files specified');
        process.exit(1);
    }
    //validate and sanitize file path
    let sanitizedPath = path.resolve(path.normalize(filename));
    // filetype: source.jaan or jaan
    // if no filetype then assume it is jaan
    // if filetype is not jaan then throw error
    if (!sanitizedPath.endsWith('.jaan')) {
        const endsWith = sanitizedPath.split('.').pop();
        //log(endsWith, endsWith === sanitizedPath);
        if (endsWith === sanitizedPath) {
            sanitizedPath = sanitizedPath + ".jaan";
        }
        else {
            console.error(`Error: Invalid file type: ${sanitizedPath}`);
            process.exit(1);
        }
    }
    if (existsSync(sanitizedPath) === false) {
        console.error(`Error: File ${sanitizedPath} not found`);
        process.exit(1);
    }
    return sanitizedPath;
}
function readFileData(filename) {
    //read file
    let filedata = readFileSync(path.resolve(path.normalize(filename)), 'utf-8');
    return filedata;
}
runCode(readFileData(processFile(filename)));
