import * as prgm from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import {CodeGen} from 'swagger-js-codegen';
import * as yaml from 'js-yaml';
import * as JsonRefs from 'json-refs';
import {getPackage} from 'loceth-config';

async function genTypes(project: {name: string, dir: string}, shouldWrite: boolean){
    try {
        const swagger = yaml.load(fs.readFileSync(path.join(project.dir, './api-spec.yaml'), 'utf-8'));
        const refs = await JsonRefs.findRefs(swagger, {
            refPostProcessor:
                ({uriDetails}) => {
                    if (uriDetails.path.indexOf('api-spec.yaml') > -1) {

                        const typeName = uriDetails.fragment.split('definitions/')[1];
                        const projectName = uriDetails.path.split('/')[0];
                        return {typeName, projectName};
                    }
                    return false;
                }
        });
        const imports = Object.keys(refs)
        .map((key) => refs[key])
        .filter((statement) => statement !== false);
        // .map(statement => statement.replace('.ts', ''));

        const source: string = CodeGen.getCustomCode({
            moduleName: project.name,
            className: '',
            swagger,
            imports,
            template: {
                class: fs.readFileSync(path.join(__dirname, '..', '..', '@api-spec/types.main.mustache'), 'utf-8'),
                method: "",
                type: fs.readFileSync(path.join(__dirname, '..', '..', '@api-spec/types.mustache'), 'utf-8')
            },
            lint: false
        });
        if(shouldWrite){
            const pathToWrite = path.join(project.dir, 'api-types.ts');
            fs.writeFileSync(pathToWrite, `${source}\r\n`);
            process.stdout.write(`Type file written at ${pathToWrite}\r\n`);
        }
        else {
            process.stdout.write(`${source}\r\n`);
        }
    }
    catch (err) {
        console.error(err);
    }
}
function toProperCase() {
    return this.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function genServices(project: {name: string, dir: string}, shouldWrite: boolean){
    let name: string | string[] = project.name
    .replace('trunomi-', '')
    .split('-');

    name = name.map((part) => {
        return toProperCase.call(part);
    });
    name = name.join('');
    try {
        const swagger = yaml.load(fs.readFileSync(path.join(project.dir, './api-spec.yaml'), 'utf-8'));
        const source: string = CodeGen.getCustomCode({
            moduleName: project.name,
            className: `${name}Services`,
            swagger,
            template: {
                class: fs.readFileSync(path.join(__dirname, '..', '..', '@api-spec/services.main.mustache'), 'utf-8'),
                method: fs.readFileSync(path.join(__dirname, '..', '..', '@api-spec/services.mustache'), 'utf-8'),
                type: fs.readFileSync(path.join(__dirname, '..', '..', '@api-spec/types.mustache'), 'utf-8')
            },
            lint: false
        });
        if(shouldWrite){
            const pathToWrite = path.join(project.dir, 'api-services.ts');
            fs.writeFileSync(pathToWrite, `${source}\r\n`);
            process.stdout.write(`Service file written at ${pathToWrite}\r\n`);
        }
        else {
            process.stdout.write(`${source}\r\n`);
        }
    }
    catch (err) {
        console.error(err);
    }
}

export function main(){
    prgm
    .version('0.0.1')
    .option('-w, --write', 'Will write the file.');

    prgm
    .command('gen-types <project>')
    .description('Build new type declarations')
    .action((projectName: string, options) => {
        genTypes(getPackage(projectName), options.parent.write);
    });

    prgm
    .command('gen-services <project>')
    .description('Build new client services')
    .action((projectName: string, options) => {
        genServices(getPackage(projectName), options.parent.write);
    });

    prgm.parse(process.argv);
}
