import * as fs from 'fs';
import * as path from 'path';
import parse from 'csv-parser';
import { Parser } from 'json2csv';
import chalk from 'chalk';

/**
 * *Convierte un archivo JSON a CSV
 * @oparam inputPath - Ruta del archivo JSON de entrada
 * @param outputPath - Ruta dela archivo CSV de salida
 * @returns Contenido CSV convertido como string
 */
export async function jsonToCsv(inputPath: string, outputPath?: string): Promise<string> {
    try{
        //Leer el archivo JSON
        const jsonContent = fs.readFileSync(inputPath, 'utf-8');
        const jsonData = JSON.parse(jsonContent);

        //Validar que sea un array
        if (!Array.isArray(jsonData)){
            throw new Error('El archivo JSON debe contener un array de objetos');

        }

        if (jsonData.length === 0){
            throw new Error('El array JSON está vacío');
        }

        //Convertir a CSV
        const parser = new Parser ();
        const csv = parser.parse (jsonData);

        //Guardar en archivo si se especifica outputPath
        if (outputPath){
            fs.writeFileSync (outputPath, csv, 'utf-8');
            console.log(chalk.green('Archivo CSV creado exitosamente; ${outputPath}'));
        }

        return csv;
    }catch (error){
        if (error instanceof SyntaxError){
            throw new Error ('Error al parsear JSON ${error.message}');
        }
        throw error;
    }
}

/**
 * Convierte un archivo CSV a JSON
 * @param inputPath - Ruta del archivo CSV de entrada
 * @param outputPath - Ruta del archivo JSON de salida (opcional)
 * @returns Contenido JSON convertido como string
 */

export async function csvToJson(inputPath: string, outputPath?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const results: any[]= [];

        //Leer y parsear el archivo CSV
        fs.createReadStream(inputPath)
        .pipe(parse())
        .on('data', (data:any)=> results.push(data))
        .on('end', ()=> {
            try { 
                const json = JSON.stringify(results,null, 2);

                //Guardar en archivo si se especifica outputPath
                if (outputPath){
                    fs.writeFileSync(outputPath, json, 'utf-8');
                    console.log(chalk.green('Archivo JSON creado exitosamente: ${outputPath}'));
                }
                resolve(json);
            }catch (error: any)   {
                reject(new Error('Error al convertir a JSON: ${error.message}'));
            }
        })
        .on('error', (error:any)) =>
    })
}