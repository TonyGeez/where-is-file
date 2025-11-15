# Where-Is 

A fast command-line tool for locating files and directories.

## Installation

```bash
npm install -g where-is-file
```

## Usage

```bash
wi <pattern> [options]
```

## Options

- `-d, --dir <path>` - Search in specified directory (default: current directory)
- `-r, --recursive` - Search recursively through subdirectories
- `--depth <num>` - Maximum depth for recursive search (default: 3)
- `-t, --type <f|d|a>` - Filter by type: f=files, d=directories, a=all (default: all)
- `-i, --ignore-case` - Case insensitive search
- `-e, --exact` - Match exact filename only
- `-m, --max <num>` - Maximum number of results to display (default: 100)
- `--hidden` - Include hidden files and directories

## Examples

Search for a file in current directory:
```bash
wi config.json
```

Search for all JavaScript files (case insensitive):
```bash
wi ".js" -t f -i
```

Find exact directory name recursively:
```bash
wi node_modules -t d --exact -r
```

Search in specific directory with custom depth:
```bash
wi "README" -d /path/to/project --depth 5 -r
```

## Notes

- By default, `node_modules` and `.git` directories are skipped during recursive search
- Hidden files and directories (starting with `.`) are excluded unless `--hidden` flag is used
- Search stops after reaching the maximum result limit
