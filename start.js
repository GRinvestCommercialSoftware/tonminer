const { spawn } = require('child_process');
const { spawnSync } = require('child_process');

const nvidiaSmiCommand = 'nvidia-smi --list-gpus';
const result = spawnSync(nvidiaSmiCommand, { shell: true });

if (result.error) {
    console.error(`Ошибка при выполнении nvidia-smi: ${result.error.message}`);
    process.exit(1);
}

if (result.status !== 0) {
    console.error(`Ошибка при выполнении nvidia-smi. Код ошибки: ${result.status}`);
    process.exit(1);
}

const output = result.stdout.toString();
const gpuCount = output.trim().split('\n').length;

console.log(`Количество GPU в системе: ${gpuCount}`);

function runProcess(gpuIndex) {
    const command = `node send_universal.js --api tonapi --bin ./pow-miner-cuda --givers 1000 --timeout 15 --gpu ${gpuIndex}`;
    const childProcess = spawn(command, { shell: true });

    childProcess.stdout.on('data', (data) => {
        console.log(`[GPU ${gpuIndex} stdout]: ${data}`);
    });

    childProcess.stderr.on('data', (data) => {
        console.error(`[GPU ${gpuIndex} stderr]: ${data}`);
    });

    childProcess.on('close', (code) => {
        console.error(`[GPU ${gpuIndex}] Process exited with code ${code}. Restarting...`);
        runProcess(gpuIndex); // Перезапуск процесса при завершении
    });

    childProcess.on('error', (err) => {
        console.error(`[GPU ${gpuIndex}] Error starting process: ${err.message}`);
    });
}
for (let i = 0; i < gpuCount; i++) {
    runProcess(i);
}

process.stdin.resume();
