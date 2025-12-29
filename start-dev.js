const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(color, message) {
  console.log(`${color}[Start-Dev] ${message}${colors.reset}`);
}

const rootDir = __dirname;
const contractsDir = path.join(rootDir, 'contracts');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

async function start() {
  const isTestnet = process.argv.includes('--testnet');
  log(colors.bright, `🚀 Starting PonderChain Development Environment (${isTestnet ? 'Testnet' : 'Local'})...`);

  if (isTestnet) {
    log(colors.yellow, "Skipping Hardhat Node & Deployment (Testnet Mode)");
    configureEnv(true);
    return;
  }

  // 1. Start Hardhat Node
  log(colors.yellow, "Starting Hardhat Node...");
  const hardhatNode = spawn('npx', ['hardhat', 'node'], { cwd: contractsDir, shell: true });

  hardhatNode.stdout.on('data', (data) => {
    // console.log(`[Hardhat]: ${data}`); // Optional: verbose logging
    if (data.toString().includes("Started HTTP and WebSocket JSON-RPC server")) {
      log(colors.green, "✅ Hardhat Node Started!");
      deployContracts();
    }
  });

  hardhatNode.stderr.on('data', (data) => {
    console.error(`[Hardhat Error]: ${data}`);
  });

  // Store processes to kill them later
  const processes = [hardhatNode];

  process.on('SIGINT', () => {
    log(colors.red, "\n🛑 Shutting down all services...");
    processes.forEach(p => p.kill());
    process.exit();
  });
}

function deployContracts() {
  log(colors.yellow, "Deploying Contracts to Localhost...");
  
  try {
    execSync('npx hardhat run scripts/deploy.js --network localhost', { cwd: contractsDir, stdio: 'inherit' });
    log(colors.green, "✅ Contracts Deployed!");
    configureEnv();
  } catch (error) {
    log(colors.red, "❌ Deployment Failed!");
    process.exit(1);
  }
}

function configureEnv(isTestnet = false) {
  log(colors.yellow, "Configuring Environment Variables...");

  const networkName = isTestnet ? 'liskSepolia' : 'localhost';
  const deploymentPath = path.join(contractsDir, 'deployments', `${networkName}.json`);
  if (!fs.existsSync(deploymentPath)) {
    log(colors.red, `❌ Deployment file not found for ${networkName}!`);
    if (isTestnet) {
      log(colors.red, "   Run 'npm run deploy:lisk-sepolia' in contracts/ first.");
    }
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const { PonderChain, PonderNFT } = deployment.contracts;

  log(colors.cyan, `PonderChain: ${PonderChain}`);
  log(colors.cyan, `PonderNFT:   ${PonderNFT}`);

  // Update Frontend .env
  const frontendEnvPath = path.join(frontendDir, '.env');
  let frontendEnvContent = "";
  if (fs.existsSync(frontendEnvPath)) {
    frontendEnvContent = fs.readFileSync(frontendEnvPath, 'utf8');
  }
  
  // Replace or Append
  const updateEnv = (content, key, value) => {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    } else {
      return content + `\n${key}=${value}`;
    }
  };

  frontendEnvContent = updateEnv(frontendEnvContent, 'VITE_PONDERCHAIN_ADDRESS', PonderChain);
  frontendEnvContent = updateEnv(frontendEnvContent, 'VITE_PONDERNFT_ADDRESS', PonderNFT);
  
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  log(colors.green, "✅ Frontend .env updated");

  // Update Backend .env
  const backendEnvPath = path.join(backendDir, '.env');
  let backendEnvContent = "";
  if (fs.existsSync(backendEnvPath)) {
    backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
  }

  backendEnvContent = updateEnv(backendEnvContent, 'PONDERCHAIN_ADDRESS', PonderChain);
  // Add other backend envs if needed
  
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  log(colors.green, "✅ Backend .env updated");

  startServers();
}

function startServers() {
  log(colors.yellow, "Starting Backend & Frontend...");

  const backend = spawn('npm', ['run', 'dev'], { cwd: backendDir, shell: true, stdio: 'inherit' });
  const frontend = spawn('npm', ['run', 'dev'], { cwd: frontendDir, shell: true, stdio: 'inherit' });

  log(colors.green, "✅ All Services Started!");
  log(colors.bright, "🌍 Frontend: http://localhost:3000 (or similar)");
  log(colors.bright, "🔙 Backend:  http://localhost:5000 (or similar)");
  log(colors.bright, "⛓️  Node:     http://127.0.0.1:8545");
}

start();
