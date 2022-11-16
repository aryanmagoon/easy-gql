#!/usr/bin/env node
const commander = require("commander");
const chalk = require("chalk");
const execSync = require("child_process").execSync;
const packageJson = require("../package.json");
const fs = require("fs-extra");
const path = require("path");
const sqlite3 = require("sqlite3");

let projectName;

//create a new commander program
const program = new commander.Command(packageJson.name)

//set the version of the program
.version(packageJson.version)
//set the arguments of the program
.arguments("<project-directory>")
//set the usage of the program
.usage(`${chalk.green("<project-directory>")}`)
.action(name => {
    projectName = name;
})
//set the options of the program
.parse(process.argv);
// if the type of project is undefined, specify the project name
if (typeof projectName === "undefined") {
    console.error("Please specify the project directory:");
    console.log(
        `  ${chalk.cyan(program.name())} ${chalk.green("<project-directory>")}`
    );
    console.log();
    console.log("For example:");
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green("my-gql")}`);
    process.exit(1);


}

const projectDest=path.join(process.cwd(), projectName);

if (fs.existsSync(projectDest)) {
    console.log(`The directory ${chalk.green(projectName)} already exists`);
    process.exit(1);

}

//use copysync to copy the template folder to the project directory
fs.copySync(path.join(__dirname, "..", "main-template"), projectName);


function yarnAvailable() {
    try {
        execSync("yarn --version", { stdio: "ignore" });
        return true;
    } catch (e) {
        return false;
    }
}
new sqlite3.Database(
    path.join(__dirname, "..", "main-template", "./database.sqlite"),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
     err=> {
        if (err) {
            //print error message with identifier
            console.log(chalk.red("Error creating db: ") + err.message);
        }
        process.chdir(projectDest);
        if (yarnAvailable()) {
            execSync("yarn install", { stdio: [0,1,2] });
        } else {
            execSync("npm install", { stdio: [0,1,2] });\
        }
    }
);