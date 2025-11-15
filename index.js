#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  performance
} = require('perf_hooks');

const BLUE = "\x1B[38;5;31m";
const BGBLUE = "\x1B[48;5;31m";
const BLUE2 = "\x1B[38;5;24m";
const BLUEBG = "\x1B[48;5;74m";
const WHITE = "\x1b[0;37m";
const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const CYAN = "\x1B[38;5;24m";
const LIGHTCYAN = "\x1B[38;5;152m";
const LIGHTCYAN2 = "\x1B[38;5;80m";
const YELLOW = "\x1b[0;33m";

const BOLD = "\x1B[1m"
const DIM = "\x1B[2m";
const RESET = "\x1B[0m";

const WARNING = `${BOLD}${YELLOW}⚠${RESET}${YELLOW}`;
const ERROR = `${BOLD}${RED}✘${RESET}${RED}`;
const SUCCESS = `${BOLD}${GREEN}✔${RESET}${GREEN}`;

const HEADI = `${WHITE}${BLUEBG}     `;
const HEAD = `${BOLD}${BLUE}██ `;
const POINTER = `${BLUE}█ ${BOLD}${BLUE}`;

const HL = `${BLUE}${BGBLUE}██████████${RESET}${BOLD}${CYAN}${BGBLUE}`;
const HR = `${RESET}${BLUE}${BGBLUE}██████████${RESET}`;
const HL2 = `${BLUE}${BGBLUE}████${RESET}${BOLD}${CYAN}${BGBLUE}`;
const HR2 = `${RESET}${BLUE}${BGBLUE}████${RESET}`;
const BAR = `${BLUE}${BGBLUE}████████████████████████████${RESET}`;

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log(`\n${BAR}`);
  console.log(`${HL} WHEREIS${HR}`);
  console.log(`${HL2} Locate files faster${HR2}`);
  console.log(`${BAR}\n`);
  console.log(`${POINTER} Usage${RESET}`);
  console.log(`  wi ${LIGHTCYAN2}<pattern> ${LIGHTCYAN}[options]${RESET}\n`);
  console.log(`${POINTER} Options${RESET}\n`);
  console.log(`  ${LIGHTCYAN}-d, --dir <path>${RESET}          Search in this directory`);
  console.log(`  ${LIGHTCYAN}-r, --recursive${RESET}           Search recursively`);
  console.log(`  ${LIGHTCYAN}--depth <num>${RESET}             Max depth for recursive search `);
  console.log(`  ${LIGHTCYAN}-t, --type <f|d|a>${RESET}        f=files, d=dirs, a=all*`);
  console.log(`  ${LIGHTCYAN}-i, --ignore-case${RESET}         Case insensitive search`);
  console.log(`  ${LIGHTCYAN}-e, --exact${RESET}               Print exact match only`);
  console.log(`  ${LIGHTCYAN}-m, --max <num>${RESET}           Max result to print`);
  console.log(`  ${LIGHTCYAN}--hidden${RESET}                  Include hidden files/dirs`);
  console.log(`\n${POINTER} Examples${RESET}\n`);
  console.log(`  ${DIM}wi ${LIGHTCYAN2}config.json${RESET}`);
  console.log(`  ${DIM}wi ${LIGHTCYAN2}".js" ${LIGHTCYAN}-t f -i${RESET}`);
  console.log(`  ${DIM}wi ${LIGHTCYAN2}node_modules ${LIGHTCYAN}-t d --exact -r${RESET}\n`);
  process.exit(0);
}

const pattern = args[0];
let searchDir = process.cwd();
let type = 'all';
let ignoreCase = false;
let exact = false;
let maxResults = 100;
let includeHidden = false;
let recursive = false;
let maxDepth = 3;

for (let i = 1; i < args.length; i++) {
  if ((args[i] === '-d' || args[i] === '--dir') && args[i + 1]) {
    searchDir = path.resolve(args[i + 1]);
    i++;
  } else if (args[i] === '-r' || args[i] === '--recursive') {
    recursive = true;
  } else if (args[i] === '--depth' && args[i + 1]) {
    maxDepth = parseInt(args[i + 1], 10);
    recursive = true;
    i++;
  } else if ((args[i] === '-t' || args[i] === '--type') && args[i + 1]) {
    const t = args[i + 1].toLowerCase();
    if (t === 'f') type = 'file';
    else if (t === 'd') type = 'dir';
    else if (t === 'a') type = 'all';
    i++;
  } else if (args[i] === '-i' || args[i] === '--ignore-case') {
    ignoreCase = true;
  } else if (args[i] === '-e' || args[i] === '--exact') {
    exact = true;
  } else if ((args[i] === '-m' || args[i] === '--max') && args[i + 1]) {
    maxResults = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--hidden') {
    includeHidden = true;
  }
}

if (!fs.existsSync(searchDir)) {
  console.log(`${ERROR} Directory not found: ${searchDir}${RESET}`);
  process.exit(1);
}


console.log(`\n${POINTER} Pattern:${RESET}${BLUE} ${pattern}${RESET}`);
console.log(`${POINTER} Directory:${RESET}${BLUE} ${searchDir}${RESET}`);
console.log(`${POINTER} Type:${RESET}${BLUE} ${type}${RESET}\n`);

const startTime = performance.now();
const results = [];

function matches(name) {
  const searchName = ignoreCase ? name.toLowerCase(): name;
  const searchPattern = ignoreCase ? pattern.toLowerCase(): pattern;

  if (exact) {
    return searchName === searchPattern;
  }
  return searchName.includes(searchPattern);
}

function searchRecursive(dir, depth = 0) {
  if (results.length >= maxResults) return;
  if (recursive && depth > maxDepth) return;

  try {
    const entries = fs.readdirSync(dir, {
      withFileTypes: true
    });

    for (const entry of entries) {
      if (results.length >= maxResults) break;

      const name = entry.name;

      if (!includeHidden && name.startsWith('.')) continue;

      const fullPath = path.join(dir, name);

      if (entry.isDirectory()) {
        if ((type === 'dir' || type === 'all') && matches(name)) {
          results.push({
            path: fullPath, type: 'DIR'
          });
        }

        if (recursive && name !== 'node_modules' && name !== '.git') {
          searchRecursive(fullPath, depth + 1);
        }
      } else if (entry.isFile()) {
        if ((type === 'file' || type === 'all') && matches(name)) {
          results.push({
            path: fullPath, type: 'FILE'
          });
        }
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
}

searchRecursive(searchDir);

const endTime = performance.now();
const duration = ((endTime - startTime) / 1000).toFixed(3);

if (results.length === 0) {
  console.log(`${WARNING} No matches found${RESET}\n`);
} else {
  console.log(`${SUCCESS} Found ${results.length} result${results.length === 1 ? '': 's'}${RESET}`);
  console.log(`\n${BLUE}------------------------${RESET}`)
  for (const result of results) {
    const typeColor = result.type === 'DIR' ? CYAN: CYAN;
    const typeLabel = result.type === 'DIR' ? '[DIRECTORY]\n ': '[FILE]\n';
    console.log(`${typeColor}${typeLabel}${RESET}${result.path}\n`);
  }
}