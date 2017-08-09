import * as fs from 'fs';

// const network = '1499407995028';
// // tslint:disable-next-line:no-var-requires
// const LOCProfileAddress: string = require('./contracts/LOCProfile.json').networks[network].address;

export enum LoggingLevel {
    Basic,
    Detailed
}

const path = require('path');


export function getPackages(ignoreList: string[] = []){
    return fs.readdirSync(path.join(__dirname, '..', '..'))
    .filter((item) => {
        if(item[0] === '@'){
            return false;
        }
        return fs.existsSync(path.join(__dirname, '..', '..', item, "package.json"));
    })
    .map((item) => {
        const project = require(path.join(__dirname, '..', '..', item, "package.json"));
        project.dir = path.join(__dirname, '..', '..', item);
        project.logging = LoggingLevel.Detailed;
        // NOTE: If a package has a build priority, then put it here.
        switch (project.name) {
            case 'loceth-blockhain':
                project.taskPriority = 1;
                break;
            case 'loceth-market-api':
                project.taskPriority = 2;
                break;
            case 'loceth-messaging-api':
                project.taskPriority = 3;
                break;
            case 'loceth-web':
                project.taskPriority = 4;
                break;
            default:
                project.taskPriority = 100;
                break;
        }
        return project;
    })
    .sort((a, b) => {
        return a.taskPriority - b.taskPriority;
    })
    .filter((project) => ignoreList.indexOf(project.name) === -1);
}

export function getPackage(desiredPackageName: string){
    return getPackages()
    .filter((project) => {
        if (project.name === desiredPackageName) {
            return true;
        }
        return false;
    })[0];
}

