#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { jsonToCsv, csvToJson, generateDefaultOutputPath, fileExists } from './utils/converter';

const program = new Command();

// Configurar el programa CLI
program
  .name('format-shift')
  .description('CLI tool to convert files between JSON and CSV formats')
  .version('1.0.0');

// Comando principal: convert
program
  .command('convert')
  .description('Convert a file between JSON and CSV formats')
  .requiredOption('-i, --input <path>', 'Path to the input file')
  .option('-o, --output <path>', 'Path to the output file (optional)')
  .requiredOption('-t, --type <type>', 'Conversion type: "json2csv" or "csv2json"')
  .action(async (options) => {
    try {
      const { input, output, type } = options;

      // Validar el tipo de conversion
      if (type !== 'json2csv' && type !== 'csv2json') {
        console.error(chalk.red('✗ Error: El tipo debe ser "json2csv" o "csv2json"'));
        process.exit(1);
      }

      // Verificar que el archivo de entrada existe
      if (!fileExists(input)) {
        console.error(chalk.red(`✗ Error: El archivo de entrada no existe: ${input}`));
        process.exit(1);
      }

      // Determinar la ruta de salida
      let outputPath = output;
      if (!outputPath) {
        // Generar nombre por defecto
        const extension = type === 'json2csv' ? '.csv' : '.json';
        outputPath = generateDefaultOutputPath(input, extension);
        console.log(chalk.yellow(`ℹ No se especificó archivo de salida. Usando: ${outputPath}`));
      }

      // Verificar que el directorio de salida existe
      const outputDir = path.dirname(outputPath);
      if (outputDir && !fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Realizar la conversion
      console.log(chalk.blue(`🔄 Convirtiendo ${input} a ${type === 'json2csv' ? 'CSV' : 'JSON'}...`));

      let result: string;

      if (type === 'json2csv') {
        result = await jsonToCsv(input, outputPath);
      } else {
        result = await csvToJson(input, outputPath);
      }

      // Si no se especifico archivo de salida, mostrar en consola
      if (!output) {
        console.log(chalk.blue('\n--- Contenido convertido ---\n'));
        console.log(result);
      }

      console.log(chalk.green('\n✓ Conversión completada exitosamente'));
    } catch (error: any) {
      console.error(chalk.red(`✗ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Parsear los argumentos de la línea de comandos
program.parse();


